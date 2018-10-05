import Model from 'yii-steroids/base/Model';

export default class PasswordResetRequestFormMeta extends Model {

    static className = 'steroids\\modules\\user\\forms\\PasswordResetRequestForm';

    static fields() {
        return {
            'email': {
                'component': 'InputField',
                'attribute': 'email',
                'type': 'email',
                'label': __('Email'),
                'required': true
            }
        };
    }

}
