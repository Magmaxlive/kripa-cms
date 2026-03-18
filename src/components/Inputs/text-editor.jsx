import CKeditor from "@/components/Editor/ck-editor";

const TextEditor = ({ TabName, InputName, editorData, setEditorData, editorLoaded }) => {

    return (
        <>
            <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-dark-3">
                    <h3 className="font-medium text-dark dark:text-white">
                        {TabName}
                    </h3>
                </div>
                <div className="flex flex-col gap-6 p-6.5">
                    <div>
                        <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                            {InputName}
                        </label>
                        <CKeditor
                            name="description"
                            value={editorData}
                            onChange={(data) => {
                                setEditorData(data);
                            }}
                            editorLoaded={editorLoaded}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default TextEditor;