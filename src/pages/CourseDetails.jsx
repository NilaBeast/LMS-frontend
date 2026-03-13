import { useParams } from "react-router-dom";

import CourseMoreInfo from "../components/course/CourseMoreInfo";

export default function CourseDetails() {
  const { id } = useParams();

  return (
    <div>
      <h2>Course Details</h2>

      <CourseMoreInfo courseId={id} />
    </div>
  );
}
