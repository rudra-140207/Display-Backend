function parseActivitiesFromText(text) {
  const activities = [];
  const lines = text.split("\n");

  lines.forEach((line) => {
    const activityMatch = line.match(/(\d{4}-\d{2}-\d{2})\s*-\s*(.*)/);
    if (activityMatch) {
      activities.push({
        startDate: new Date(activityMatch[1]),
        name: activityMatch[2],
        endDate: new Date(activityMatch[1]),
        description: "No description",
        year: new Date(activityMatch[1]).getFullYear(),
      });
    }
  });

  return activities;
}

module.exports = parseActivitiesFromText;
