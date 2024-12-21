const mongoose = require('mongoose')


const forOwn = require('lodash/forOwn');

const AutoIncrement = require('mongoose-sequence')(mongoose);




const JobSequenceSchema = new mongoose.Schema(
  {
    seqId: { type: String, required: true }
  },
  { collection: 'JobSequence' }
);

JobSequenceSchema.statics.getNextAlphaNumSeq = async function (seqId, data) {
  return this.findOneAndUpdate(
    { seqId },
    { $set: { ...data } },
    { upsert: true, new: true }
  ).exec();
};

const SequenceModel = mongoose.model('jobSequence', JobSequenceSchema);

const replaceCharAt = (str, index, character) => {
  return str.substring(0, index) + character + str.substring(index + character.length);
};

/**
* Returns the next alphanumeric character if given
* character is not the last one (z, Z, 9), else returns null
*/
const incrementChar = (seqChar) => {
  if (seqChar.match(/[zZ9]/)) {
    return null;
  }

  return String.fromCharCode(seqChar.charCodeAt(0) + 1);
};

/**
* Returns starting character (a, A, 0) if given character is
* the last one (z, Z, 9)
*/
const resetChar = (charToReset) => {
  if (charToReset === 'Z') {
    return 'A';
  } else if (charToReset === 'z') {
    return 'a';
  } else {
    return '0';
  }
};

/**
* Returns boolean after checking if given id has reached last
* value, like 9999 or zzzz or zz9999
*/
const isLastId = (id, prefix, suffix) => {
  id = deaffixId(id, prefix, suffix);

  return id.match(/[0-8a-yA-Y]+/) === null;
};

/**
* Removes prefixes and/or suffixes (if any)
*/
const deaffixId = (affixedValue, prefix, suffix) => {
  let idValue = affixedValue;

  if (prefix) {
    idValue = idValue.replace(new RegExp('^' + prefix), '');
  }

  if (suffix) {
    idValue = idValue.replace(new RegExp(suffix + '$'), '');
  }

  return idValue;
};

/**
* Adds prefixes and/or suffixes (if any)
*/
const affixId = (idValue = '', prefix = '', suffix = '') => {
  let affixedValue = idValue;

  if (prefix) {
    affixedValue = prefix + affixedValue;
  }

  if (suffix) {
    affixedValue = affixedValue + suffix;
  }

  return affixedValue;
};

/**
* Calculate and returns the next incremented value.
* Increment should happen only for one character at a time
*/
const nextId = (currentSeqValue = '', prefix = '', suffix = '') => {
  // Removes prefixes and/or suffixes (if any)
  currentSeqValue = deaffixId(currentSeqValue, prefix, suffix);

  let incVal;

  // If it is last available as per given configuration, 
  // returns the same after adding prefixes and/or suffixes (if any)
  if (isLastId(currentSeqValue, prefix, suffix)) {
    incVal = affixId(currentSeqValue, prefix, suffix);
    return incVal;
  }

  /**
   * Split the current sequence value, so indvidual characters
   * can be incremented as per given configuration
   */
  let seqChars = currentSeqValue.split('');

  // Iterates through characters and process them
  for (let i = seqChars.length - 1; i >= 0; i--) {
    let seqChar = seqChars[i];

    // Increment only if character is alphabet or number
    if (seqChar.match(/^[0-9a-zA-Z]+$/)) {
      let incrementedChar = incrementChar(seqChar);

      /**
       * If character is incremented, say from "2" to "3" or "B" to "C"
       * then replace the character in given string and return it (after adding
       * prefixes and/or suffixes). Because, we should increment 
       * only one character at a time
       * 
       * If increment did not happen because it is a last characher (z, Z or 9)
       * then reset the character to starting character (a, A or 0) and 
       * continue the iteration
       */
      if (incrementedChar) {
        incVal = affixId(replaceCharAt(currentSeqValue, i, incrementedChar), prefix, suffix);
        return incVal;
      } else {
        currentSeqValue = replaceCharAt(currentSeqValue, i, resetChar(seqChar));
      }
    }
  }

  incVal = affixId(currentSeqValue, prefix, suffix);

  return incVal;
};

/**
* Define the field(s) in SequenceSchema, if already does not exist
*/
const fixPathType = ($options) => {
  forOwn($options.fields, (value, key) => {
    const path = JobSequenceSchema.path(key);

    !path && JobSequenceSchema.path(key, String);
  });
};

/**
* Set the "auto incremental" field's value in given document
*/
const setFieldsValue = async ($doc, $options) => {
  let lastSeq = await SequenceModel.findOne({ seqId: $options.seqId }).exec();

  // Create a new document, if does not exist
  if (lastSeq === null) {
    lastSeq = new SequenceModel({});
  }

  /**
   * Iterate through all given fields, to set next "auto incremented" for
   * each field in Sequence document. Set the initial/start value, 
   * if it's a new Sequence document
   */
  forOwn($options.fields, (value, key) => {
    const lastSeqValue = lastSeq ? lastSeq.get(key) : null;

    lastSeq &&
      lastSeq.set(
        key,
        !lastSeqValue
          ? affixId(value.startWith, value.prefix, value.suffix)
          : nextId(lastSeqValue, value.prefix, value.suffix)
      );
  });

  /**
   * Save the updated/newly created Sequence document.
   * This will return the saved/updated Sequence document
   */
  const alphaNumRes = await SequenceModel.getNextAlphaNumSeq($options.seqId, lastSeq);

  // Now set the new "auto incremented" value in given document
  forOwn($options.fields, (value, key) => {
    $doc[key] = alphaNumRes.get(key);
  });
};

/**
* Mongoose plugin function definition
* 
* Here we can define Schema's "pre" hook(s), as we should 
* set "auto incremental" field's value before saving/updating document
* 
* This plugin accepts 2 arguments:
* 
* @param $schema - Schema - mongoose Schema reference to which we want to bind this plugin
* @param $options - Object - This should be JavaScript Object with 2 properties:
* 
*       - fields {Object}: It's "keys" should be name of the fields (which
*            has to be "auto incremental") of the given Schema. Value of each 
*            "key" (field name) is the configuration object for that field. 
*            We can define the following options for each field: 
*            - startWith {String}: This property can be used to define "Sequence Id"
*                 format, length (what should be size of id) and from where the 
*                 sequence should begin. Uppercase characters increment to next 
*                 Uppercase character only and same is with lowercase.
*                 For example, if startWith is"AAaa001", then it's last value would be "ZZzz999"
*            - prefix {String} - to be prefixed with "Sequence Id" string after increment
*            - sufix {String} - to be sufixed with "Sequence Id" string after increment       
*            prefix and sufix will be constants only.
*       - seqId {String}: Identifier to be used in Sequence Schema to find and increment
*           existing field's value (if any) and create new one
*/
function alphaNumSequencePlugin($schema, $options) {
  $schema.pre('save', async function (next) {

    
    fixPathType($options);

    const $doc = this;
    await setFieldsValue($doc, $options);

    next();
  });

  $schema.pre(
    'insertMany',
    async function (next, $docs) {
      fixPathType($options);

      for (let i = 0; i < $docs.length; i++) {
        await setFieldsValue($docs[i], $options);
      }

      next();
    }
  );
}


const JobOrderSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    customer: {
      type: String,
      required: true,
    },
    jobOrderNo: {
      type: Number,
      immutable: true

    },
    status: {
      type: String,
      required: true,
      default: "warping&covering",
    },
    elastics: {
      type: [
        {
          id: {
            type: mongoose.Types.ObjectId,
            ref: "Elastic",
          },
          quantity: { type: Number },
        },
      ],
      required: true,
    },
    wastageElastic: {
      type: [
        {
          id: {
            type: mongoose.Types.ObjectId,
            ref: "Elastic",
          },
          quantity: { type: Number },
        },
      ],
      default: [],
    },
    packedElastic: {
      type: [
        {
          id: {
            type: mongoose.Types.ObjectId,
            ref: "Elastic",
          },
          quantity: { type: Number },
        },
      ],
      default: [],
    },
    producedElastic: {
      type: [
        {
          id: {
            type: mongoose.Types.ObjectId,
            ref: "Elastic",
          },
          quantity: { type: Number },
        },
      ],
      default: [],
    },

    order: {
      type: mongoose.Types.ObjectId,
      ref: "Orders",
    },
    warping: {
      type: mongoose.Types.ObjectId,
      ref: "Warping",

    },
    covering: {
      type: mongoose.Types.ObjectId,
      ref: "Covering",

    },

    machine: {
      type: mongoose.Types.ObjectId,
      ref: "Machine",

    },

    shiftDetails: [
      {
        type: mongoose.Types.ObjectId,
        ref: "ShiftDetail",
      }

    ],
    wastages: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Wastage",
      }

    ],
    jobNo:{type:Number},
    packingDetails: [
      {
        type: mongoose.Types.ObjectId,
        ref: "packing",
      },
   

    ],
    default: []
  },
  { timestamps: true }
);



JobOrderSchema.plugin(AutoIncrement, { inc_field: 'jobOrderNo' });

// JobOrderSchema.plugin(AutoIncrement, { inc_field: 'jobNo' });

const JobOrder = mongoose.model("jobOrder", JobOrderSchema);
module.exports = JobOrder;