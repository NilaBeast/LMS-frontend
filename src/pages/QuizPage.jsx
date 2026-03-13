import { useParams } from "react-router-dom";
import QuizPlayer from "../components/QuizPlayer";

export default function QuizPage() {
  const { chapterId } = useParams();

  return <QuizPlayer chapterId={chapterId} />;
}
