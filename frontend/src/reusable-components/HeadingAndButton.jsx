/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

const HeadingAndButton = ({
  title,
  buttonText,
  buttonIcon: ButtonIcon,
  onButtonClick,
}) => {
  return (
    <div className="mb-4 flex justify-between items-center">
      <h2 className="text-lg font-medium text-slate-700">{title}</h2>
      <Link
        to="#"
        onClick={onButtonClick} // Do this in imported page: onButtonClick={() => { setCurrentPage(!currentPage) }}
        className="flex justify-center items-center rounded p-2 border"
      >
        {ButtonIcon && <ButtonIcon className="inline text-xl me-1" />}
        {buttonText}
      </Link>
    </div>
  );
};

export default HeadingAndButton;
