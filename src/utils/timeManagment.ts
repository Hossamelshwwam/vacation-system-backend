// Helper function to convert time string to minutes
export const timeToMinutes = (timeStr: string): number => {
  const [time, period] = timeStr.toLowerCase().split(/(?=[ap]m)/);
  let [hours, minutes] = time.split(":").map(Number);

  if (period === "pm" && hours !== 12) {
    hours += 12;
  } else if (period === "am" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
};

// Helper function to calculate duration in minutes
export const calculateDuration = (
  startTime: string,
  endTime: string
): number => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  return endMinutes - startMinutes;
};
