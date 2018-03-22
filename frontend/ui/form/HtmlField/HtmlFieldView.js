import React from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';

import {html} from 'components';
const bem = html.bem('HtmlFieldView');

export default class HtmlFieldView extends React.PureComponent {

    static propTypes = {
        label: PropTypes.string,
        hint: PropTypes.string,
        required: PropTypes.bool,
        disabled: PropTypes.bool,
        editorProps: PropTypes.object,
        className: PropTypes.string,
    };

    render() {
        return (
            <div>
                <ReactQuill {...this.props.editorProps} />
            </div>
        );
    }

}
