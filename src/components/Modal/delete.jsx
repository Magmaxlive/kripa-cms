import React, { useEffect, useState, useRef } from 'react';


const DeleteComponent = ({ deleteModalId, deleteTitle, DeleteModal, FetchDeleteAPI }) => {
    const myRef = useRef();
    const handleClickOutside = (e) => {
        if (e.target.id == "DeleteModalData") { DeleteModal(false) }
    };
    const handleClickInside = () => DeleteModal(false);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickInside);
    }, []);

    return (

        <>

                <div ref={myRef} onClick={(e) => handleClickOutside(e)} id="DeleteModalData" className="justify-center fixed items-center shadow-2xl overflow-y-auto inset-0 z-50 outline-none focus:outline-none">
                    <div className="relative w-auto mt-32 mx-auto max-w-3xl">
                        {/*content*/}
                        <div className="border-0  shadow-lg relative flex flex-col w-full bg-gray-100 dark:bg-[#1a1a1a] outline-none focus:outline-none">
                            {/*body*/}
                            <div className="flex h-16 flex-shrink-0 items-center justify-between px-6">
                                <div className="text-lg font-semibold text-black">
                                    Are you sure ?
                                </div>
                            </div>
                            <hr className="border-hr" />
                            <div className="flex-1 px-6 py-5 sm:py-6">
                                <p>Are you sure you wish to delete <span className='font-bold'>{deleteTitle}</span></p>
                            </div>
                            <div className="flex h-16 flex-shrink-0 items-center justify-end space-x-2 bg-layer-3 px-6 shadow-lg">
                                <button
                                    type="button"
                                    onClick={(e) => DeleteModal(false)}
                                    className="inline-flex cursor-pointer rounded-lg items-center justify-center  border-2 border-secondary px-4 py-2.5 text-sm font-semibold shadow-sm hover:border-secondary-accent hover:bg-secondary-accent focus:outline-none focus:ring-2 focus:ring-primary/80 focus:ring-offset-0 disabled:opacity-30 disabled:hover:border-secondary disabled:hover:bg-secondary disabled:hover:text-white dark:focus:ring-white/80" >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => FetchDeleteAPI(deleteModalId, "")}
                                    className="inline-flex cursor-pointer items-center bg-blue-800 text-white rounded-lg justify-center  border-2 border-critical px-4 py-2.5 text-sm font-semibold shadow-sm hover:border-critical-accent hover:bg-critical-accent focus:outline-none focus:ring-2 focus:ring-orange-400/80 focus:ring-offset-0 disabled:opacity-30 disabled:hover:border-critical disabled:hover:bg-critical disabled:hover:text-white dark:focus:ring-white/80" >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

        </>
    )
}

export default DeleteComponent;