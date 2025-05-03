import { Card, CardContent } from "@/components/ui/card-themed";
import { motion } from "framer-motion";

export default function NotFound() {
    return (
          <Card className="h-full">
            <CardContent className="flex flex-col items-center justify-center h-full">
              <h1
                className="text-2xl font-bold text-center"
              >
                Page Not Found
              </h1>
              <p
                className="text-lg text-muted-foreground mt-4"
              >
                Sorry, the page you are looking for does not exist.
              </p>
            </CardContent>
          </Card>
    );
  }