import { DB } from "@/app/libs/DB";
import { zEnrollmentGetParam, zEnrollmentPostBody } from "@/app/libs/schema";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  const studentId = request.nextUrl.searchParams.get("studentId");

  //validate input
  const parseResult = zEnrollmentGetParam.safeParse({
    studentId,
  });
  if (parseResult.success === false) {
    return NextResponse.json(
      {
        ok: false,
        message: parseResult.error.issues[0].message,
      },
      { status: 400 }
    );
  }

  //add
  const courseNoList = [];
  for (const enroll of DB.enrollments) {
    //enroll = {StudentId: string, courseNo: string}
    if (enroll.studentId === studentId) {
      courseNoList.push(enroll.courseNo);
    }
  }

  //add
  const courses = [];
  for (const courseNo of courseNoList) {
    //course = { courseNo: "261207",  title: "BASIC COMP ENGR LAB",},{courseNo: "001101", title: " FUNDAMENTAL ENGLISH 1", }
    // course = undentifined
    const course = DB.courses.find((x) => x.courseNo === courseNo);

    if (!course)
      return NextResponse.json({
        ok: false,
        message: "Oops! try again later",
        status: 500,
      });
    courses.push(course);
  }
  return NextResponse.json({
    ok: true,
    courses,
  });
};

export const POST = async (request) => {
  const body = await request.json();
  const parseResult = zEnrollmentPostBody.safeParse(body);
  if (parseResult.success === false) {
    return NextResponse.json(
      {
        ok: false,
        message: parseResult.error.issues[0].message,
      },
      { status: 400 }
    );
  }

  const { studentId, courseNo } = body;
  const foundStudent = DB.students.find((x) => x.studentId === studentId);
  const foundCourse = DB.courses.find((x) => x.courseNo === courseNo);
  if (!foundStudent || !foundCourse)
    return NextResponse.json(
      {
        ok: false,
        message: "Student Id or Course No is not existed",
      },
      { status: 400 }
    );

  const foundEnroll = DB.enrollments.find(
    (x) => x.studentId === studentId && x.courseNo === courseNo
  );
  //if(foundenroll !=== undefined)
  if (!foundEnroll)
    return NextResponse.json(
      {
        ok: false,
        message: "Student already enrolled that course",
      },
      { status: 400 }
    );

  //save in db
  DB.enrollments.push({
    studentId,
    courseNo,
  });
  return NextResponse.json({
    ok: true,
    message: "Student has enrolled course",
  });
};
