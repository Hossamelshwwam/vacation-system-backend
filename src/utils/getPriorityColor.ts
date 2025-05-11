// Helper function to get color based on priority
const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case "critical":
      return "#dc3545"; // Red
    case "urgent":
      return "#ffc107"; // Yellow
    case "normal":
      return "#28a745"; // Green
    default:
      return "#6c757d"; // Gray
  }
};

export default getPriorityColor;
