import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/dal';
import ProfileEditor from './ProfileEditor';

export default async function ProfilePage() {
  const user = await verifySession();
  if (!user) redirect('/login');

  const p = user.athleteProfile;
  if (!p) redirect('/onboarding');

  return (
    <ProfileEditor
      initial={{
        firstName: p.firstName,
        lastName: p.lastName,
        classYear: p.classYear,
        state: p.state,
        school: p.school,
        gender: p.gender,
        bio: p.bio,
        profilePhotoUrl: p.profilePhotoUrl,
        dominantHand: p.dominantHand,
        style: p.style,
        seasonAverage: p.seasonAverage,
        highGame: p.highGame,
        highSeries: p.highSeries,
        revRate: p.revRate,
        ballSpeed: p.ballSpeed,
        spareConversion: p.spareConversion,
        pap: p.pap,
        axisTilt: p.axisTilt,
        axisRotation: p.axisRotation,
        coachName: p.coachName,
        coachContact: p.coachContact,
        proShop: p.proShop,
        bowlingCenter: p.bowlingCenter,
        usbcClub: p.usbcClub,
        usbcId: p.usbcId,
        gpa: p.gpa,
        act: p.act,
        sat: p.sat,
        ncaaStatus: p.ncaaStatus,
        intendedMajor: p.intendedMajor,
        isActivelyRecruiting: p.isActivelyRecruiting,
        profileVisibility: p.profileVisibility,
        preferredDivisions: p.preferredDivisions,
        preferredRegions: p.preferredRegions,
      }}
    />
  );
}