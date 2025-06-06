import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { Footer } from "@/components/layout/footer"

interface Props {
  params: {
    id: string
  }
}

const RespondPage = async ({ params: { id } }: Props) => {
  const feedbackRequest = await prisma.feedbackRequest.findUnique({
    where: {
      id,
    },
  })

  if (!feedbackRequest) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-[450px]">
          <CardHeader>
            <CardTitle>Respond to Feedback Request</CardTitle>
            <CardDescription>You are responding to a feedback request.</CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" placeholder="Your Name" />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="message">Your Feedback</Label>
                  <Input id="message" placeholder="Your Feedback" />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancel</Button>
            <Button>Submit</Button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

export default RespondPage
