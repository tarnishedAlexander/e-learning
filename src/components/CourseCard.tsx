import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, BookOpen } from "lucide-react";

interface CourseCardProps {
  title: string;
  instructor: string;
  duration: string;
  students: number;
  lessons: number;
  progress?: number;
  image: string;
  onEnroll?: () => void;
  onContinue?: () => void;
}

export const CourseCard = ({
  title,
  instructor,
  duration,
  students,
  lessons,
  progress,
  image,
  onEnroll,
  onContinue,
}: CourseCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <CardHeader className="space-y-2">
        <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{instructor}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{students}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{lessons} lessons</span>
          </div>
        </div>
        {progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
      <CardFooter>
        {progress !== undefined ? (
          <Button onClick={onContinue} className="w-full">
            Continue Learning
          </Button>
        ) : (
          <Button onClick={onEnroll} variant="outline" className="w-full">
            Enroll Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
