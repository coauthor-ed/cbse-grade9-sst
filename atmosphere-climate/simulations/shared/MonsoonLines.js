// MonsoonLines - the dated lines of the south-west monsoon over India, in lon/lat, plus the places
// a lesson usually asks about. Data and two small lookups only: nothing here draws.
//
// Source: NCERT Grade 9 Understanding Society, Part 1, chapter 3. Fig. 3.10 (normal dates of the
// advancing monsoon) and Fig. 3.11 (normal dates of the retreating monsoon). Read from the PDF's own
// vector strokes, not by eye: longitude from the linear axis ticks, latitude from a Mercator fit to
// the printed ticks (worst tick error 0.05 of a point). Each date is ONE line. The book prints its
// date at both ends, which is why it looks like two tails.
// Every line runs from its western end to its northern or eastern end. `day` counts days from the
// first line of its own list, so a scene can pace a drawing-in by the real gaps.
// The figures do not carry a line south of 15 Oct: south of that line this data says nothing.
//
// Use with any projection: map each [lon, lat] through it. Draw India only from the Survey of India
// layer, with the credit on screen. These lines are the book's, and "normal" means an average year.

export const ADVANCE = [
  { date: '22 May', day: 0, line: [[85.15, 7.18], [86.45, 8.51], [88.04, 9.66], [90.51, 11.47], [92.89, 12.94], [94.65, 14], [96.07, 14.69], [97.41, 15.21], [98.49, 15.54]] },
  { date: '26 May', day: 4, line: [[79.92, 7.23], [81.39, 8.72], [82.73, 10.07], [83.88, 11.2], [84.92, 11.84], [86.69, 12.41], [88.16, 12.67], [89.8, 13.12], [90.9, 13.72], [92.34, 15.14], [93.81, 16.41], [95.57, 17.63], [96.71, 18.47], [98.71, 19.82]] },
  { date: '1 June', day: 10, line: [[74.87, 10.17], [76.63, 10.44], [77.73, 10.72], [79.28, 11.26], [80.46, 11.56], [83.45, 12.5], [85.88, 13.04], [87.71, 13.66], [89.57, 14.69], [91.31, 16.32], [92.69, 17.94], [93.8, 19.48], [94.94, 20.72]] },
  { date: '5 June', day: 14, line: [[73.61, 14.61], [74.32, 15.01], [75, 15.2], [75.7, 15.29], [76.54, 15.2], [77.31, 14.86], [78.54, 14.45], [79.51, 14.23], [80.21, 14.2], [81.33, 14.2], [83.27, 14.32], [85.26, 14.61], [86.77, 15.19], [88.28, 16.1], [89.26, 17.25], [89.86, 18.4], [90.39, 20.18], [90.5, 22.46], [90.5, 23.84], [90.31, 25.6], [89.9, 27.3], [89.62, 28.07], [89.16, 28.89], [88.93, 29.37], [88.65, 29.81]] },
  { date: '10 June', day: 19, line: [[72.33, 17.48], [72.86, 17.83], [73.4, 18.18], [73.86, 18.5], [74.42, 18.71], [75.36, 18.73], [76.4, 18.66], [77.18, 18.48], [77.76, 18.2], [78.59, 17.81], [79.9, 17.28], [80.69, 17.07], [81.81, 16.91], [82.66, 16.93], [83.72, 17], [84.89, 17.16], [86.05, 17.58], [87.21, 18.45], [87.92, 19.23], [88.55, 20.47], [88.79, 21.55], [89, 22.64], [88.98, 23.27], [88.91, 24.33], [88.81, 25.12], [88.62, 25.74], [88.37, 26.46], [87.89, 27.36], [87.35, 28.29], [86.82, 29.14], [86.34, 29.82]] },
  { date: '15 June', day: 24, line: [[71.36, 18.85], [72.28, 19.61], [72.95, 20.03], [73.53, 20.28], [74.03, 20.57], [74.95, 21.01], [75.89, 21.26], [76.64, 21.29], [78.02, 21.14], [79.48, 21.1], [80.79, 21.14], [83.29, 21.1], [83.97, 21.26], [84.68, 21.64], [85.08, 22.08], [85.45, 22.64], [85.86, 23.26], [86.16, 23.85], [86.23, 24.47], [85.99, 25.55], [85.62, 26.64], [84.85, 28.08], [83.43, 31.06], [82.24, 33.21]] },
  { date: '20 June', day: 29, line: [[70.23, 20.59], [71.6, 21.33], [72.76, 22.05], [73.37, 22.42], [73.79, 22.55], [74.44, 22.73], [76.53, 23.08], [78.64, 23.56], [79.59, 23.74], [80.87, 23.88], [81.96, 23.83], [82.6, 23.81], [83.05, 24.06], [83.59, 24.63], [83.8, 24.92], [83.82, 25.17], [83.67, 25.46], [83.29, 25.95], [82.51, 26.71], [81.32, 27.69], [80.3, 28.49], [79.85, 29.03], [79.29, 29.7], [78.97, 30.3], [78.85, 30.86], [78.85, 31.41], [79.03, 32.05], [79.29, 32.35], [79.57, 32.59]] },
  { date: '25 June', day: 34, line: [[69.13, 21.12], [70.38, 21.71], [71.81, 22.43], [72.83, 23.07], [73.89, 23.56], [75.16, 24.18], [75.77, 24.42], [76.93, 24.83], [77.79, 25.05], [78.48, 25.26], [79.46, 25.88], [80.01, 26.38], [80.16, 26.69], [80.2, 27.07], [80.03, 27.49], [79.38, 28.18], [78.5, 29.25], [77.58, 30.26], [76.85, 31.11], [75.91, 32.1], [75.48, 32.67], [75.3, 33.03], [75.17, 33.53], [75.3, 33.9], [75.72, 34.21], [77.17, 35], [77.93, 35.28], [79.11, 35.6], [80.28, 35.91]] },
  { date: '30 June', day: 39, line: [[68.17, 22.88], [69.71, 23.44], [70.74, 23.97], [72.35, 24.7], [73.32, 25.05], [74.38, 25.37], [75.45, 25.78], [76.09, 26.19], [76.73, 26.73], [76.96, 27.22], [76.93, 28.11], [76.54, 28.91], [75.51, 30.33], [75.22, 30.78], [74.77, 31.33], [73.87, 32.37], [72.45, 33.91], [71.77, 34.71]] },
  { date: '5 July', day: 44, line: [[67.62, 24.17], [68.75, 24.27], [69.96, 24.68], [70.53, 25.03], [71.43, 25.51], [72.38, 26.02], [73.1, 26.49], [73.59, 27.16], [73.7, 27.8], [73.55, 28.73], [73.4, 29.69], [72.87, 30.96], [72.19, 32.06], [71.66, 32.73]] },
  { date: '8 July', day: 47, line: [[67.65, 25.61], [68.61, 26.08], [69.54, 26.68], [70.29, 27.14], [70.62, 27.48], [71.03, 28.07], [71.51, 28.82], [71.66, 29.37], [71.66, 30.02], [71.18, 31.04], [70.58, 32.06], [70.18, 32.69]] },
];

export const RETREAT = [
  { date: '17 Sep', day: 0, line: [[68.27, 23.5], [69.33, 23.85], [70.41, 24.38], [71.3, 24.88], [71.42, 24.94], [72.36, 25.63], [73.09, 26.41], [73.8, 27.55], [74.15, 28.27], [74.31, 28.61], [74.52, 29.32], [74.54, 29.37], [74.54, 29.56], [74.54, 29.57], [74.56, 30.5], [74.49, 31.17]] },
  { date: '20 Sep', day: 3, line: [[67.91, 22.09], [70.38, 23.39], [71.98, 24.27], [73.32, 24.9], [74.45, 25.55], [75.1, 26.13], [75.48, 26.75], [75.92, 27.65], [76.1, 28.46], [76.13, 29.23], [76.05, 29.98], [76, 30.53], [75.89, 30.93], [75.43, 31.79], [74.76, 32.77], [74.04, 33.61], [72.39, 35.31]] },
  { date: '25 Sep', day: 8, line: [[69.08, 21.44], [70.45, 21.85], [71.59, 22.42], [73.21, 23.08], [74.29, 23.56], [75.56, 24.19], [76.5, 24.87], [77.52, 25.82], [78.39, 26.93], [79.01, 28.2], [79.26, 29.2], [79.63, 30.9], [80.16, 32.64], [80.34, 33.21]] },
  { date: '30 Sep', day: 13, line: [[69.95, 20.32], [71.53, 20.93], [73.11, 21.49], [75.22, 22.08], [76.32, 22.35], [77.3, 22.7], [78.35, 23.16], [78.85, 23.6], [79.23, 24.15], [79.75, 24.95], [80.13, 25.77], [80.68, 27.3], [81.33, 28.96], [81.71, 30.61], [81.93, 31.43]] },
  { date: '5 Oct', day: 18, line: [[72.61, 18.87], [74.13, 19.34], [75.38, 19.88], [76.38, 20.28], [77.3, 20.5], [78.28, 20.75], [79.89, 21.21], [80.93, 21.63], [82, 22.34], [82.81, 22.8], [83.43, 23.23], [84.28, 23.82], [84.8, 24.25], [85.04, 24.75], [85.23, 25.68], [85.37, 27.31], [85.51, 28.6]] },
  { date: '10 Oct', day: 23, line: [[72.69, 16.24], [75.04, 16.9], [76.66, 17.48], [78.46, 18.28], [80.42, 19.05], [81.44, 19.47], [83.21, 20.26], [84.47, 20.57], [85.84, 21.23], [86.83, 21.81], [87.5, 22.31], [88.25, 23.01], [88.52, 23.56], [88.73, 24.52], [88.85, 25.66], [88.82, 27.14], [88.7, 28.05]] },
  { date: '15 Oct', day: 28, line: [[74.79, 13.15], [75.74, 14.15], [76.37, 14.75], [77.18, 15.33], [78.02, 15.86], [79.07, 16.55], [80.19, 17.1], [81.27, 17.42], [82.82, 17.9], [83.85, 18.15], [84.4, 18.22], [85.46, 18.26], [87.39, 17.93], [89.72, 17.42], [91.65, 16.78], [93.11, 16.4], [94.66, 16.13], [96.25, 16.26], [99.06, 17.47], [100.08, 17.98]] },
];

// Places read against the lines above by reachedBy() and a distance check. `on` means the place lies
// within about 20 km of that line. Otherwise it lies between `after` and `by`.
// `before` means the place lies beyond the first line. `retreat` is null where the map has no line
// (south of 15 Oct).
export const PLACES = {
  thiruvananthapuram: { name: 'Thiruvananthapuram', ll: [76.95, 8.5], advance: { after: '26 May', by: '1 June' }, retreat: null },
  kochi: { name: 'Kochi', ll: [76.27, 9.93], advance: { after: '26 May', by: '1 June' }, retreat: null },
  chennai: { name: 'Chennai', ll: [80.27, 13.08], advance: { after: '1 June', by: '5 June' }, retreat: null },
  bengaluru: { name: 'Bengaluru', ll: [77.6, 12.97], advance: { after: '1 June', by: '5 June' }, retreat: null },
  shillong: { name: 'Shillong', ll: [91.88, 25.57], advance: { after: '1 June', by: '5 June' }, retreat: { after: '10 Oct', by: '15 Oct' } },
  mumbai: { name: 'Mumbai', ll: [72.88, 19.07], advance: { after: '10 June', by: '15 June' }, retreat: { on: '5 Oct' } },
  kolkata: { name: 'Kolkata', ll: [88.36, 22.57], advance: { after: '10 June', by: '15 June' }, retreat: { after: '10 Oct', by: '15 Oct' } },
  nagpur: { name: 'Nagpur', ll: [79.08, 21.15], advance: { on: '15 June' }, retreat: { on: '5 Oct' } },
  patna: { name: 'Patna', ll: [85.14, 25.6], advance: { after: '15 June', by: '20 June' }, retreat: { on: '5 Oct' } },
  lucknow: { name: 'Lucknow', ll: [80.95, 26.85], advance: { after: '20 June', by: '25 June' }, retreat: { after: '30 Sep', by: '5 Oct' } },
  delhi: { name: 'Delhi', ll: [77.2, 28.6], advance: { after: '25 June', by: '30 June' }, retreat: { after: '20 Sep', by: '25 Sep' } },
  jodhpur: { name: 'Jodhpur', ll: [73.02, 26.3], advance: { on: '5 July' }, retreat: { on: '17 Sep' } },
  jaisalmer: { name: 'Jaisalmer', ll: [70.9, 26.9], advance: { after: '5 July', by: '8 July' }, retreat: { before: '17 Sep' } },
};

const inPoly = (x, y, poly) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [a, b] = poly[i], [e, f] = poly[j];
    if ((b > y) !== (f > y) && x < ((e - a) * (y - b)) / (f - b) + a) c = !c;
  }
  return c;
};

/** The earliest entry of ADVANCE or RETREAT whose line has passed this [lon, lat], or null. */
export function reachedBy(list, ll) {
  for (let i = 0; i < list.length; i++) {
    const l = list[i].line, first = l[0], last = l[l.length - 1];
    let poly;
    if (list === RETREAT) poly = [...l, [last[0], 50], [50, 50], [50, first[1]]];
    else if (i < 3) poly = [...l, [120, last[1]], [120, -10], [50, -10], [50, first[1]]];
    else poly = [...l, [last[0], 50], [120, 50], [120, -10], [50, -10], [50, first[1]]];
    if (inPoly(ll[0], ll[1], poly)) return list[i];
  }
  return null;
}

/** A place's date as plain words: "5 July", or "between 1 June and 5 June". */
export function dateWords(d) {
  if (!d) return '';
  if (d.on) return d.on;
  return d.before ? `before ${d.before}` : `between ${d.after} and ${d.by}`;
}
