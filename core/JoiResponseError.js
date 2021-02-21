export default function joiResponseError(joi_errors = {}) {
    let errors = {};
    for (let error of joi_errors.details) {
        errors[error.context.key] = error.message
    }
    return {status: false, errors}
}