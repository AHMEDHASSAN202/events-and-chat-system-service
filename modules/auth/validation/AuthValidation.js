import Joi from '@hapi/joi';

const schema  = Joi.object({
    title: Joi.string().required().max(20),
    status: Joi.boolean().required()
});

export function StoreValidation(fields) {
    return schema.validate(fields);
}