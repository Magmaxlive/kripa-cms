
const TdBody = ({ xData, isTitle }) => {

    return (
        <>
            <td className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pl-7.5`}>
                {isTitle ? (
                    <h5 className="text-dark dark:text-white">
                        {xData}
                    </h5>
                ) : (
                    <p className="text-dark dark:text-white">
                        {xData}
                    </p>
                )}

            </td>
        </>
    )
}

export default TdBody;