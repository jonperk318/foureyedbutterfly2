export const dateToString = (date: string | null) => {
  return (
    date &&
    new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  );
};
