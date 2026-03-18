import ButtonDefault from "@/components/Buttons/ButtonDefault";
import DownloadButton from "@/components/Tables/component/download-b";

const ButtonTwo = ({ label, buttonEvent, }) => {
    return (<>
        <div className="flex justify-end">
            <ButtonDefault label={label} link="#" customClasses="bg-primary rounded-lg text-white py-[11px] px-6 my-2">
                <DownloadButton />
            </ButtonDefault>
        </div>
    </>);
};
export default ButtonTwo;
