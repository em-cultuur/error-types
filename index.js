/**
 * global error types
 */

const Boom = require('@hapi/boom');

class ErrorBase extends Error {
  constructor(message, status = 500) {
    super(message);
    this.boomStatus = status
  }
  asBoom() {
    return Boom.badData(this.message);
  }
}

class ErrorNotImplemented extends ErrorBase {
  // https://javascript.info/custom-errors
  constructor(message, status) {
    super(message, status);
    // can not use this.constructor.name:   it returns 'unexpected string'
    this.type = 'ErrorNotImplemented';
  }
  asBoom() {
    return Boom.notImplemented(this.message);
  }
}

/**
 * an error of which the type can be set
 * Boom is the forbidden error
 */
class ErrorTyped extends ErrorBase {
  constructor(type, message) {
    super(message);
    // can not use this.constructor.name:   it returns 'unexpected string'
    this.type = type;
  }
  asBoom() {
    return Boom.forbidden(this.message);
  }

}
class ErrorNotFound extends ErrorBase {
  constructor(field = 'no name', message= 'not found', status) {
    super(message);
    // can not use this.constructor.name:   it returns 'unexpected string'
    this.type = 'ErrorNotFound';
    this.name = field;
  }
  asBoom() {
    let b = Boom.notFound(this.message);
    b.output.payload.details =  {fieldname: this.fieldname};
    return b;
  }

}
class ErrorDuplicate extends ErrorBase {
  constructor(fieldname = 'no name', message= 'duplicate', status) {
    super(message, status);
    // can not use this.constructor.name:   it returns 'unexpected string'
    this.type = 'ErrorDuplicate';
    this.fieldname = fieldname;
  }

  asBoom() {
    let b = Boom.conflict('duplicate');
    b.output.payload.details =  {fieldname: this.fieldname, message: this.message};
    return b;
  }
}

class ErrorAccessDenied extends ErrorBase {
  constructor(message= 'access denied', status) {
    super(message, status);
    // can not use this.constructor.name:   it returns 'unexpected string'
    this.type = 'ErrorAccessDenied';
  }
  asBoom() {
    let b = Boom.forbidden(this.message);  // 403 not 401 (unautherized)
    return b;
  }
}

class ErrorDocumentNotFound extends ErrorBase {
  constructor(document = '', message= 'document not found', status) {
    super(message, status);
    this.document = document;
    // can not use this.constructor.name:   it returns 'unexpected string'
    this.type = 'ErrorDocumentNotFound';
  }
  asBoom() {
    let b = Boom.notFound(this.message);
    b.output.payload.details =  {document: this.document};
    return b;
  }
}

class ErrorFieldNotFound extends ErrorBase {
  constructor(fieldName = '', message, status) {
    if (message === undefined) {
      message = `field (${fieldName}) was not found`;
    }
    super(message, status);
    this.fieldName = fieldName;
    // can not use this.constructor.name:   it returns 'unexpected string'
    this.type = 'ErrorFieldNotFound';
  }
  asBoom() {
    let b = Boom.notFound(this.message);
    b.output.payload.details =  {fieldName: this.fieldName};
    return b;
  }
}



class ErrorFieldNotValid extends ErrorBase {
  constructor(fieldname = '', message= 'data not valid', status) {
    super(message === false ? fieldname : message, status);
    this.fieldname = message === false ? ' -- no field --' : fieldname;
    // can not use this.constructor.name:   it returns 'unexpected string'
    this.type = 'ErrorFieldNotValid';
  }
  asBoom() {
    let b = Boom.conflict('not valid');
    b.output.payload.details =  {fieldname: this.fieldname, message: this.message};
    return b;
  }

}
class ErrorFile extends ErrorBase {
  constructor(filename= '', message= 'file error found', status) {
    super(message, status);
    this.document = filename;
    // can not use this.constructor.name:   it returns 'unexpected string'
    this.type = 'ErrorFile';
  }

  asBoom() {
    let b = Boom.notFound('file not found');
    b.output.payload.details =  {document: this.document, message: this.message};
    return b;
  }
}


class ErrorFieldNotAllowed extends ErrorBase {
  constructor(fields, message = false, status) {
    super(message ? message : `field${fields.length > 1 ? 's' : ''} "${fields.join(', ')}" not defined`, status);
    this.type = 'ErrorFieldNotAllowed';
    this.fields = fields
  }
}

class ErrorBadRequest extends ErrorBase {
  constructor(message, status) {
    super(message, status);
    this.type = 'ErrorBadRequest';
  }
}
class ErrorServerError extends ErrorBase {
  constructor(message, status) {
    super(message, status);
    this.type = 'ErrorServerError';
  }
}

class ErrorUnknown extends ErrorBase {
  constructor(message, status) {
    super(message, status);
    this.type = 'ErrorUnknown';
  }
}


class ErrorDataError extends ErrorBase {
  constructor(message = 'data error', status) {
    if (message instanceof Object) {
      super('data error', status !== undefined ? status : 401);
      this.errors = [];
      this.add(message.type, message.fieldname, message.message);
    } else {
      super(message, 401);
      this.errors = [];
    }
    this.name = 'ErrorDataError';
  }

  get length() {
    return this.errors.length;
  }
  error(index) {
    return this.errors[index];
  }
  add(type, fieldname, message, data) {
    this.errors.push( {
      type: type,
      fieldname: fieldname,
      message: message,
      data: data
    })
  }
}


function toBoomError(err, request) {
  if (err.asBoom) {
    return err.asBoom(request)
  } else {
    switch(err.name) {
      case 'CastError' :
        let b = Boom.conflict('not valid');
        b.output.payload.details =  {fieldname: err.path, message: err.message};
        return b;
      default: {
        console.error('[Error undefined]:', err.message);
        return Boom.badImplementation(err.message);
      }
    }
  }
}


module.exports = {
  toBoomError,
  ErrorBase,
  ErrorNotImplemented,
  ErrorNotFound,
  ErrorDuplicate,
  ErrorAccessDenied,
  ErrorFieldNotValid,
  ErrorDocumentNotFound,
  ErrorFieldNotFound,
  ErrorFieldNotAllowed,
  ErrorFile,
  ErrorTyped,
  ErrorBadRequest,
  ErrorServerError,
  ErrorUnknown
};
