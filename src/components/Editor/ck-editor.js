import React, { useEffect, useRef } from "react";
import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';

export default function CKeditor({ onChange, editorLoaded, name, value }) {

    const editorRef = useRef();
    const { CKEditor, ClassicEditor } = editorRef.current || {};
    
    useEffect(() => {
        editorRef.current = {
            CKEditor: require("@ckeditor/ckeditor5-react").CKEditor,
            ClassicEditor: require("@ckeditor/ckeditor5-build-classic"),
        };
    }, []);

    return (
        <>
            {editorLoaded ? (
                <CKEditor
                    type=""
                    config={{
                        plugin: ["33333", "Essentials"]
                    }}
                    style={{
                        "borderRadius": "16px",
                        "fontSize": "14px"
                    }}
                    name={name}
                    editor={ClassicEditor}
                    data={value}
                    onChange={(event, editor) => {
                        const data = editor.getData();
                        onChange(data);
                    }}
                />
            ) : (
                <div>Editor loading</div>
            )}
        </>
    )
}