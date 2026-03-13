import { useParams } from "react-router-dom";
import CourseBuilder from "../components/course-builder/CourseBuilder";

export default function CourseBuilderPage() {
  const { courseId } = useParams();
  return <CourseBuilder courseId={courseId} />;
}
