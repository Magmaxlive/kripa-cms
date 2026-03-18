
const InputForm = ({ TabName, InputName, PlaceHolder, TitleEvent, Id }) => {

    return (
        <>
            <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-dark-3">
                    <h3 className="font-medium text-dark dark:text-white">
                       {TabName}
                    </h3>
                </div>
                <div className="flex flex-col gap-5.5 p-6.5">
                    <div>
                        <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                          {InputName}
                        </label>
                        <input id={Id} onChange={(e) => TitleEvent(e.target.value)} type="text" 
                            placeholder={PlaceHolder} 
                            className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary" />
                    </div>
                </div>
            </div>
        </>
    )
}

export default InputForm;