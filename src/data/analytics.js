// Sample numbers for the Reports screens (A06, A07, A13, A14). They are copied from the Figma design.
// The screens say "Sample data - replace with real counts". Replace them when the backend exists.

export const PERIODS = {
  weekly: {
    title: 'Weekly results · Dec 7 – Dec 13, 2026', pick: 'Week', pickValue: 'Dec 7 – Dec 13, 2026', totalLabel: 'weekly total', chartTitle: 'Logins and bookings per day',
    logins: 64, booked: 18, female: 11, male: 7,
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], loggedIn: [12, 10, 14, 9, 13, 3, 3], bookedSeries: [4, 3, 5, 2, 4, 0, 0],
    years: [6, 5, 4, 3], concerns: [6, 4, 3, 3, 2], scale: [2, 4, 6, 4, 2], average: 3.0,
    avgLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], avgSeries: [3.0, 2.9, 3.2, 3.0, 3.1, 2.8, 3.0], assessments: 18,
    yearAvg: [3.0, 3.1, 2.9, 3.2], questionAvg: [3.1, 2.9, 3.0], avgTitle: 'Average score per day',
  },
  monthly: {
    title: 'Monthly results · December 2026', pick: 'Month', pickValue: 'December 2026', totalLabel: 'monthly total', chartTitle: 'Logins and bookings per week',
    logins: 232, booked: 60, female: 36, male: 24,
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'], loggedIn: [52, 64, 58, 40, 18], bookedSeries: [14, 18, 15, 9, 4],
    years: [20, 16, 14, 10], concerns: [19, 14, 11, 9, 7], scale: [6, 13, 20, 14, 7], average: 3.1,
    avgLabels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'], avgSeries: [3.2, 3.0, 3.1, 2.9, 3.7], assessments: 60,
    yearAvg: [3.0, 3.1, 3.0, 3.2], questionAvg: [3.2, 2.9, 3.1], avgTitle: 'Average score per week',
  },
  yearly: {
    title: 'Yearly results · 2027', pick: 'Year', pickValue: '2027', totalLabel: 'yearly total', chartTitle: 'Logins and bookings per month',
    logins: 1712, booked: 442, female: 265, male: 177,
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    loggedIn: [90, 140, 164, 152, 120, 48, 72, 160, 184, 208, 182, 192], bookedSeries: [22, 35, 41, 38, 30, 12, 18, 40, 46, 52, 48, 60],
    years: [140, 118, 104, 80], concerns: [138, 104, 86, 66, 48], scale: [40, 96, 150, 108, 48], average: 3.1,
    avgLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    avgSeries: [3.1, 3.2, 3.0, 3.1, 3.2, 3.0, 3.1, 3.1, 3.2, 3.0, 3.1, 3.2], assessments: 442,
    yearAvg: [3.0, 3.1, 3.1, 3.2], questionAvg: [3.2, 3.0, 3.1], avgTitle: 'Average score per month',
  },
}
export const YEAR_LEVELS = ['1st year', '2nd year', '3rd year', '4th year']
export const TABS = [['weekly', 'Weekly'], ['monthly', 'Monthly'], ['yearly', 'Yearly']]
export const SCALE_LABELS = ['1 · [Lowest label]', '2', '3', '4', '5 · [Highest label]']
// counts with labels and rounded percent of the total, for the horizontal bars
export const withPct = (counts, labels) => { const total = counts.reduce((a, b) => a + b, 0); return counts.map((n, i) => ({ n, label: labels[i], pct: Math.round((n / total) * 100) })) }
