export const formatDate = (dateString: string) => {
  console.log(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  return new Intl.DateTimeFormat("en-US", options).format(new Date(dateString));
};
