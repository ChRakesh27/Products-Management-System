import PropTypes from "prop-types";

function DateFormate(timestamp, dateFormat = "") {
  //   const userDetails = useSelector((state) => state.users);
  //   const dateFormat =
  //     userDetails.asCompanies[userDetails.selectedCompanyIndex]?.dateFormat || "";

  if (!timestamp?.seconds) {
    return;
  }
  const milliseconds =
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
  const date = new Date(milliseconds);

  const day = String(date.getDate()).padStart(2, "0");
  const monthNum = String(date.getMonth() + 1).padStart(2, "0");
  const monthShort = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();

  let formattedDate = "";

  if (dateFormat === "DD/MM/YYYY") {
    formattedDate = `${day}/${monthNum}/${year}`;
  } else if (dateFormat === "MM/DD/YYYY") {
    formattedDate = `${monthNum}/${day}/${year}`;
  } else if (dateFormat === "DD/Mon/YYYY") {
    formattedDate = `${day}/${monthShort}/${year}`;
  } else if (dateFormat === "YYYY-MM-DD") {
    formattedDate = `${year}-${monthNum}-${day}`;
  } else {
    formattedDate = `${day}/${monthNum}/${year}`;
  }

  return formattedDate;
}

DateFormate.propTypes = {
  timestamp: PropTypes.shape({
    seconds: PropTypes.number.isRequired,
    nanoseconds: PropTypes.number.isRequired,
  }).isRequired,
};

export default DateFormate;
