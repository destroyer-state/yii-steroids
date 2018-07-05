import Model from 'yii-steroids/base/Model';

import {locale} from 'components';

export default class LoginFormMeta extends Model {

    static className = 'steroids\\modules\\user\\forms\\LoginForm';

    static fields() {
        return {
            'login': {
                'component': 'InputField',
                'attribute': 'login',
                'label': locale.t('Логин или email'),
                'required': true
            },
            'password': {
                'component': 'PasswordField',
                'attribute': 'password',
                'label': locale.t('Пароль'),
                'required': true
            },
            'rememberMe': {
                'component': 'CheckboxField',
                'attribute': 'rememberMe',
                'label': locale.t('Запомнить меня')
            },
            'reCaptcha': {
                'component': 'InputField',
                'attribute': 'reCaptcha',
                'label': locale.t('Я не робот')
            },
            'google2faCode': {
                'component': 'InputField',
                'attribute': 'google2faCode',
                'label': locale.t('Google 2FA Code')
            },
        };
    }
}
