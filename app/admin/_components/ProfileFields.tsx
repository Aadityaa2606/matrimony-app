"use client";

import { educations } from "@/app/(protected)/register/RegisterClient";
import type { Profile } from "@prisma/client";
import { input, label } from "./ui";

const L = ({ t, children, wide }: { t: string; children: React.ReactNode; wide?: boolean }) => (
  <label className={`${label} ${wide ? "sm:col-span-2" : ""}`}>{t}{children}</label>
);

export default function ProfileFields({ profile }: { profile?: Profile | null }) {
  const p = profile;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <L t="Full name"><input name="fullName" defaultValue={p?.fullName} required className={input} /></L>
      <L t="Gender">
        <select name="gender" defaultValue={p?.gender ?? ""} required className={input}>
          <option value="">Select</option><option value="BRIDE">Bride</option><option value="GROOM">Groom</option>
        </select>
      </L>
      <L t="Date of birth"><input type="date" name="dateOfBirth" defaultValue={p?.dateOfBirth.toISOString().slice(0, 10)} required className={input} /></L>
      <L t="Height"><input name="height" defaultValue={p?.height} placeholder={`e.g. 5'6"`} required className={input} /></L>
      <L t="Education">
        <select name="education" defaultValue={p?.education ?? ""} required className={input}>
          <option value="">Select</option>
          {educations.map(([v]) => <option key={v} value={v}>{v}</option>)}
        </select>
      </L>
      <L t="Profession"><input name="profession" defaultValue={p?.profession} required className={input} /></L>
      <L t="Salary (optional)"><input name="salary" defaultValue={p?.salary ?? ""} className={input} /></L>
      <L t="Location"><input name="location" defaultValue={p?.location} required className={input} /></L>
      <L t="Community"><input name="community" defaultValue={p?.community} required className={input} /></L>
      <L t="Sub-caste (optional)"><input name="subCaste" defaultValue={p?.subCaste ?? ""} className={input} /></L>
      <L t="Has horoscope">
        <select name="hasHoroscope" defaultValue={p ? (p.hasHoroscope ? "yes" : "no") : "no"} className={input}>
          <option value="yes">Yes</option><option value="no">No</option>
        </select>
      </L>
      <L t="Parent contact"><input name="parentContact" type="tel" defaultValue={p?.parentContact} required className={input} /></L>
      <L t={p ? "Replace profile photo (optional)" : "Profile photo"}>
        <input type="file" name="profilePhoto" accept="image/*" required={!p} className={`${input} cursor-pointer p-0 pr-3`} />
      </L>
      <L t="Add more photos (up to 5 in total)">
        <input type="file" name="additionalPhotos" accept="image/*" multiple className={`${input} cursor-pointer p-0 pr-3`} />
      </L>
    </div>
  );
}
