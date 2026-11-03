"use client";

import { educations } from "@/app/(protected)/register/RegisterClient";
import type { Profile } from "@prisma/client";

const L = ({ t, children }: { t: string; children: React.ReactNode }) => (
  <label className="block text-sm">{t}{children}</label>
);
const cls = "w-full rounded border p-1";

export default function ProfileFields({ profile }: { profile?: Profile | null }) {
  const p = profile;
  return (
    <div className="grid max-w-xl gap-2">
      <L t="Full name"><input name="fullName" defaultValue={p?.fullName} className={cls} /></L>
      <L t="Gender">
        <select name="gender" defaultValue={p?.gender ?? ""} className={cls}>
          <option value="">Select</option><option value="BRIDE">Bride</option><option value="GROOM">Groom</option>
        </select>
      </L>
      <L t="Date of birth"><input type="date" name="dateOfBirth" defaultValue={p?.dateOfBirth.toISOString().slice(0, 10)} className={cls} /></L>
      <L t="Height"><input name="height" defaultValue={p?.height} className={cls} /></L>
      <L t="Education">
        <select name="education" defaultValue={p?.education ?? ""} className={cls}>
          <option value="">Select</option>
          {educations.map(([v]) => <option key={v} value={v}>{v}</option>)}
        </select>
      </L>
      <L t="Profession"><input name="profession" defaultValue={p?.profession} className={cls} /></L>
      <L t="Salary (optional)"><input name="salary" defaultValue={p?.salary ?? ""} className={cls} /></L>
      <L t="Location"><input name="location" defaultValue={p?.location} className={cls} /></L>
      <L t="Community"><input name="community" defaultValue={p?.community} className={cls} /></L>
      <L t="Sub-caste (optional)"><input name="subCaste" defaultValue={p?.subCaste ?? ""} className={cls} /></L>
      <L t="Has horoscope">
        <select name="hasHoroscope" defaultValue={p ? (p.hasHoroscope ? "yes" : "no") : "no"} className={cls}>
          <option value="yes">Yes</option><option value="no">No</option>
        </select>
      </L>
      <L t="Parent contact"><input name="parentContact" defaultValue={p?.parentContact} className={cls} /></L>
      <L t={p ? "Replace profile photo (optional)" : "Profile photo"}><input type="file" name="profilePhoto" accept="image/*" className={cls} /></L>
      <L t="Add more photos (up to 5 in total)"><input type="file" name="additionalPhotos" accept="image/*" multiple className={cls} /></L>
    </div>
  );
}
