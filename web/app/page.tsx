import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect to welcome page for now
  // Later this will check auth and redirect appropriately
  redirect("/welcome");
}
