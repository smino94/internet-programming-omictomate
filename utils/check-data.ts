import fs from 'fs';
import chalk from 'chalk';

const red = message => console.log(chalk.red(message));
const green = message => console.log(chalk.green(message));
const yellow = message => console.log(chalk.yellow(message));

const validate = (condition: boolean, good: string, bad: string) => {
    if (condition) {
        green(good);
    } else {
        red(bad);
    }
}

interface StudentData {
    id: number, // required, unique
    firstName: string, // required
    lastName: string, // required
    studentId: string, // required, format: YYYY-NNNN where Y is year, N is number
    dateOfBirth: string, // required, ISO 8601 date format
    email: string, // required, must be a valid email
    degree: string, // required, must be a valid degree from degrees endpoint
    year: number, // required, between 1 and 4
    courses: [ // array of course records
        {
            code: string, // must be a valid course from courses endpoint
            grade: { // optional, if course is graded
                percentage: number,  // required, between 0 and 100
                letter: string // required, calculated from percentage, according to grading scale
            },
            semester: string // autumn or spring, required
        }
    ]
}

interface DegreeData {
    id: number, // required, unique
    name: string, // required
    code: string, // required, unique, 2-4 uppercase letters
    yearsToComplete: number, // required, between 3 and 4
    active: boolean // required
}

interface CourseData {
    id: number, // required, unique
    name: string, // required
    code: string, // required, unique, 2-4 uppercase letters followed by 3 numbers
    semester: string, // required, autumn or spring
    yearOfStudy: number // required, 1-4
}

interface DB {
    students: StudentData[],
    degrees: DegreeData[],
    courses: CourseData[]
}

const fileLocation = './code/template/db/students.json';

const data: DB = JSON.parse(fs.readFileSync(fileLocation, 'utf8'));
yellow(`Data successfully loaded from ${fileLocation}`);
yellow(`Detected ${data.students.length} students`);
yellow(`Detected ${data.degrees.length} degrees`);
yellow(`Detected ${data.courses.length} courses`);

yellow("--- Checking degrees ---");
//unique id for each degree
const degreeIds = new Set<number>(data.degrees.filter(degree => degree.id).map(degree => degree.id));
validate(degreeIds.size === data.degrees.length, "Degree ids are present and unique", "Degree ids are not unique or are missing");

// every degree has a name
validate(data.degrees.every(degree => degree.name), "All degrees have a name", "Some degrees are missing a name");

// every degree has a unique code
const dcodes = new Set<string>(data.degrees.filter(degree => degree.code).map(degree => degree.code));
validate(dcodes.size === data.degrees.length, "Degree codes are present and unique", "Degree codes are not unique or are missing");

// years to complete is between 3 and 4
validate(data.degrees.every(degree => degree.yearsToComplete >= 3 && degree.yearsToComplete <= 4), "All degrees have a valid yearsToComplete", "Some degrees have invalid yearsToComplete");

// active is boolean
validate(data.degrees.every(degree => typeof degree.active === 'boolean'), "All degrees have a valid active field", "Some degrees have invalid active field");

yellow("--- Checking courses ---");

//unique id for each course
const courseIds = new Set<number>(data.courses.filter(course => course.id).map(course => course.id));
validate(courseIds.size === data.courses.length, "Course ids are present and unique", "Course ids are not unique or are missing");

// every course has a name
validate(data.courses.every(course => course.name), "All courses have a name", "Some courses are missing a name");

// every course has a unique code
const ccodes = new Set<string>(data.courses.filter(course => course.code).map(course => course.code));
validate(ccodes.size === data.courses.length, "Course codes are present and unique", "Course codes are not unique or are missing");

// every code starts with a valid degree code and has only numbers after
validate(data.courses.every(course => {
    const degreeCode = course.code.slice(0, 2);
    const courseCode = course.code.slice(2);
    return dcodes.has(degreeCode) && !isNaN(parseInt(courseCode));
}), "All courses have a valid code", "Some courses have invalid code");

// semester is either autumn or spring
validate(data.courses.every(course => course.semester === 'autumn' || course.semester === 'spring'), "All courses have a valid semester", "Some courses have invalid semester");

// yearOfStudy is between 1 and 4
validate(data.courses.every(course => course.yearOfStudy >= 1 && course.yearOfStudy <= 4), "All courses have a valid yearOfStudy", "Some courses have invalid yearOfStudy");

// yearOfStudy is valid for the degree specified in the code
validate(data.courses.every(course => {
    const degreeCode = course.code.slice(0, 2);
    const degree = data.degrees.find(degree => degree.code === degreeCode);
    if (!degree) return false;
    return degree.yearsToComplete >= course.yearOfStudy;
}), "All courses have a valid yearOfStudy for the degree", "Some courses have invalid yearOfStudy for the degree");

yellow("--- Checking students ---");

//unique id for each student
const studentIds = new Set<number>(data.students.filter(student => student.id).map(student => student.id));
validate(studentIds.size === data.students.length, "Student ids are present and unique", "Student ids are not unique or are missing");

// every student has a first name
validate(data.students.every(student => student.firstName), "All students have a first name", "Some students are missing a first name");

// every student has a last name
validate(data.students.every(student => student.lastName), "All students have a last name", "Some students are missing a last name");

// studentId is in the correct format
validate(data.students.every(student => {
    const year = student.studentId.slice(0, 4);
    const number = student.studentId.slice(5);
    return year.length === 4 && number.length === 4 && !isNaN(parseInt(year)) && !isNaN(parseInt(number));
}), "All students have a valid studentId", "Some students have invalid studentId");

// dateOfBirth is in ISO 8601 format
validate(data.students.every(student => {
    const date = new Date(student.dateOfBirth);
    return date.toLocaleDateString('en-ca') === student.dateOfBirth;
}), "All students have a valid dateOfBirth", "Some students have invalid dateOfBirth");

// email is a valid email
validate(data.students.every(student => {
    const email = student.email;
    const emailParts = email.split('@');
    return emailParts.length === 2 && emailParts[0].length > 0 && emailParts[1].includes('.');
}), "All students have a valid email", "Some students have invalid email");

// degree is a valid degree from the degrees endpoint
validate(data.students.every(student => {
    const degree = student.degree;
    return dcodes.has(degree);
}), "All students have a valid degree", "Some students have invalid degree");

// year is between 1 and 4
validate(data.students.every(student => student.year >= 1 && student.year <= 4), "All students have a valid year", "Some students have invalid year");

// year is valid for the degree
validate(data.students.every(student => {
    const degree = data.degrees.find(degree => degree.code === student.degree);
    if (!degree) return false;
    return degree.yearsToComplete >= student.year;
}), "All students have a valid year for the degree", "Some students have invalid year for the degree");

// courses is an array
validate(data.students.every(student => Array.isArray(student.courses)), "All students have a valid courses field", "Some students have invalid courses field");

// courses are valid courses from the courses endpoint
validate(data.students.every(student => {
    return student.courses.every(course => ccodes.has(course.code));
}), "All students have valid courses", "Some students have invalid courses");

// grade is valid if present (both percentage and letter)
const gradeRegex = /^[ABCD][+-]?|F$/;
validate(data.students.every(student => {
    return student.courses.every(course => {
        if (!course.grade) return true;
        return course.grade.percentage >= 0 && course.grade.percentage <= 100 && gradeRegex.test(course.grade.letter);
    });
}), "All students have valid grades", "Some students have invalid grades");

// semester is autumn or spring
validate(data.students.every(student => {
    return student.courses.every(course => course.semester === 'autumn' || course.semester === 'spring');
}), "All students have valid semesters", "Some students have invalid semesters");
