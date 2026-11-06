import { getMember } from "@/lib/member";
import { RegisterClient } from "../../register/RegisterClient";

export default async function EditProfilePage() {
  const p = (await getMember())?.profile;
  if (!p) return null; // layout already gates on an ACTIVE member, who always has a profile
  return (
    <div className="mx-auto max-w-md px-4 pb-6 pt-2">
      <RegisterClient
        edit
        initial={{
          fullName: p.fullName,
          gender: p.gender,
          dateOfBirth: p.dateOfBirth.toISOString().slice(0, 10),
          height: p.height,
          education: p.education,
          profession: p.profession,
          salary: p.salary ?? "",
          location: p.location,
          community: p.community,
          subCaste: p.subCaste ?? "",
          hasHoroscope: p.hasHoroscope,
          parentContact: p.parentContact.replace(/\D/g, "").slice(-10),
          profilePhoto: p.profilePhoto,
          additionalPhotos: p.additionalPhotos,
        }}
      />
    </div>
  );
}
