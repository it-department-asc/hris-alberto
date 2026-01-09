'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Megaphone } from 'lucide-react';
import { createAnnouncement } from '@/lib/firebase/announcements';
import toast from 'react-hot-toast';

interface AnnouncementSeederProps {
  userId: string;
  userName: string;
}

// Company celebration images from Unsplash (free to use)
const celebrationImages = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80', // Conference
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80', // Team celebration
  'https://images.unsplash.com/photo-1529543544277-750e0cd50b76?w=800&q=80', // Office party
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80', // Balloons celebration
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80', // Team meeting
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80', // Business team
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80', // Awards ceremony
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80', // Confetti celebration
  'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80', // Party celebration
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80', // Fireworks
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80', // Concert/event
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80', // Colorful celebration
];

// Announcement templates for various company events
const announcementTemplates = [
  // Company Anniversary
  {
    category: 'celebration' as const,
    priority: 'high' as const,
    titles: [
      '🎉 Happy Company Anniversary!',
      '🎊 Celebrating Our Journey Together!',
      '🥳 Another Year of Excellence!',
    ],
    contents: [
      `We're thrilled to announce that today marks another incredible year for our company! 

Thank you to each and every one of you for being part of this amazing journey. Your dedication, hard work, and passion have made us who we are today.

Let's celebrate this milestone together! 🎂

Join us for a special celebration in the office pantry at 3:00 PM.`,
      `It's official - we've completed another successful year! 🎉

From humble beginnings to where we are now, every achievement has been possible because of YOU - our incredible team.

Here's to more years of innovation, growth, and success together!

Special treats will be served all day in the break room! 🍰`,
      `Today we celebrate not just a company anniversary, but the collective spirit of our amazing team!

Looking back at all we've accomplished fills us with pride:
• Launched groundbreaking projects
• Welcomed fantastic new team members  
• Overcame challenges together
• Created lasting memories

Here's to many more years of excellence! 🌟`,
    ],
  },
  // Year-End Party
  {
    category: 'event' as const,
    priority: 'high' as const,
    titles: [
      '🎄 Annual Year-End Celebration!',
      '✨ End of Year Party Announcement',
      '🎅 Holiday Party - Save the Date!',
    ],
    contents: [
      `Get ready to celebrate the end of an amazing year! 🎉

📅 Date: December 20, 2026
🕕 Time: 6:00 PM onwards
📍 Venue: Grand Ballroom, City Hotel

Dress Code: Semi-formal (Holiday theme encouraged!)

RSVP by December 15th. Plus ones are welcome!

Let's end the year on a high note together! 🥂`,
      `It's time for our favorite event of the year - the Annual Holiday Party! 🎊

This year's theme: Winter Wonderland ❄️

What to expect:
🍽️ Gourmet dinner
🎁 Raffle prizes & giveaways
🎵 Live entertainment
📸 Photo booth fun
🕺 Dance floor action

Mark your calendars and get ready to party!`,
      `The countdown to our Year-End Bash has begun! 🎆

Join us for an evening of:
• Delicious food & drinks
• Recognition of outstanding performers
• Fun games & activities
• Music & dancing
• Surprise entertainment!

Attendance is mandatory... for FUN! 😄

Details to follow. Stay tuned!`,
    ],
  },
  // Employee Recognition
  {
    category: 'celebration' as const,
    priority: 'normal' as const,
    titles: [
      '🏆 Employee of the Month Announcement!',
      '⭐ Outstanding Performance Recognition',
      '🌟 Celebrating Our Star Performers!',
    ],
    contents: [
      `We're excited to announce our Employee of the Month! 🎉

This recognition goes to team members who consistently go above and beyond, demonstrating:
• Excellence in their work
• Positive attitude & teamwork
• Innovation & initiative
• Leadership qualities

Congratulations to all nominees! Your hard work doesn't go unnoticed.

Winners will be announced at the town hall meeting this Friday! 🏆`,
      `It's time to celebrate excellence! ⭐

We believe in recognizing those who make our workplace exceptional. This month's spotlight shines on employees who have:

✓ Exceeded their targets
✓ Helped colleagues succeed
✓ Brought creative solutions
✓ Represented our values

Stay tuned for the big reveal! 🎊`,
      `A round of applause for our amazing team! 👏

Every day, we witness incredible dedication and talent across all departments. This month, we want to especially recognize those who have made extraordinary contributions.

Remember: Every effort counts, every achievement matters, and every one of you is valued!

Celebration details coming soon! 🎈`,
    ],
  },
  // Team Building
  {
    category: 'event' as const,
    priority: 'normal' as const,
    titles: [
      '🎯 Team Building Day Announcement!',
      '🤝 Quarterly Team Bonding Event',
      '🎪 Fun Day Out - Team Activity!',
    ],
    contents: [
      `Time to step away from our desks and have some fun together! 🎉

Our quarterly team building event is here:

📅 Date: Next Friday
🕘 Time: 9 AM - 5 PM
📍 Location: Adventure Park

Activities include:
• Team challenges & games
• Outdoor adventures
• Group lunch
• Prizes for winners!

Transportation and meals provided. Wear comfortable clothes! 👟`,
      `Get ready for an exciting day of team bonding! 🎊

This month's activity: Escape Room Challenge! 🔐

Teams will compete to solve puzzles, crack codes, and escape the fastest!

What you need to know:
• Date: This Saturday
• Meet at office lobby at 9 AM
• Lunch will be provided
• Prizes for top 3 teams!

Sign up with your department head by Wednesday. Let's see which team has the best chemistry! 💪`,
      `It's Team Building Time! 🎯

Nothing brings us together like a little friendly competition and lots of laughter!

This quarter's theme: Sports Day! ⚽🏀🏐

Events:
• Relay races
• Volleyball tournament
• Tug of war
• Fun carnival games

All fitness levels welcome - it's about FUN, not winning! (But winning is fun too 😉)

Details in your email. See you there!`,
    ],
  },
  // New Policy/Update
  {
    category: 'policy' as const,
    priority: 'normal' as const,
    titles: [
      '📋 Important Policy Update',
      '📢 New Company Guidelines',
      '✅ Updated Work Policies',
    ],
    contents: [
      `We're excited to announce updates to our company policies that reflect our commitment to a better workplace! 📝

Key Updates:
• Enhanced flexible work arrangements
• Updated leave policies
• New wellness benefits
• Improved parental leave

These changes take effect next month. Full details will be shared via email.

Questions? Reach out to HR! We're here to help. 💬`,
      `Continuous improvement is part of who we are! 🚀

We've been listening to your feedback and made the following updates:

✓ Streamlined approval processes
✓ Updated expense policies
✓ New remote work guidelines
✓ Enhanced training opportunities

Check the employee handbook for complete details. Your suggestions matter to us!`,
      `New year, new improvements! 🌟

Based on your valuable feedback, we're implementing changes to make your work life better:

📌 More flexible scheduling options
📌 Simplified time-off requests
📌 Additional wellness days
📌 Updated travel policies

Full documentation available on the company portal. Let's make this year our best yet!`,
    ],
  },
  // Wellness/Health
  {
    category: 'general' as const,
    priority: 'normal' as const,
    titles: [
      '💪 Wellness Wednesday Initiative!',
      '🧘 Mental Health Awareness Month',
      '❤️ Employee Wellness Program Launch',
    ],
    contents: [
      `Your wellbeing matters to us! 💚

Introducing: Wellness Wednesdays! 🧘‍♀️

Every Wednesday, we'll offer:
• 15-minute guided meditation (12 PM)
• Healthy snacks in the pantry
• Wellness tips & resources
• Optional stretching sessions

Remember: A healthy team is a happy team!

Join us this Wednesday to kick off this initiative! 🌱`,
      `May is Mental Health Awareness Month! 🧠💙

We're committed to supporting your mental wellbeing with:

• Free counseling sessions available
• Mental health resources & hotlines
• Stress management workshops
• "Mental Health Day" - take one when you need it

You are not alone. It's okay to ask for help. 

Resources available on the HR portal. Let's break the stigma together! 💪`,
      `Exciting news! Our Employee Wellness Program is here! 🎉

What's included:
🏃 Gym membership subsidies
🍎 Nutrition consultations
😴 Sleep wellness workshops
🧘 Yoga & meditation classes
🩺 Annual health screenings

Because taking care of yourself isn't a luxury - it's a necessity!

Sign up through HR to start your wellness journey today! ✨`,
    ],
  },
  // Welcome New Employees
  {
    category: 'general' as const,
    priority: 'low' as const,
    titles: [
      '👋 Welcome to Our New Team Members!',
      '🎉 New Faces in the Office!',
      '✨ Growing Our Family - New Hires!',
    ],
    contents: [
      `Please join us in welcoming our newest team members! 🎊

We're thrilled to have fresh talent and perspectives joining our family. 

To our new colleagues: We're so glad you're here! Don't hesitate to reach out if you need anything.

To everyone: Let's make sure our new team members feel at home. A simple hello goes a long way! 👋

Welcome aboard! We can't wait to achieve great things together! 🚀`,
      `Our team is growing! 🌱

This month, we welcome several amazing individuals to different departments. Their skills, experience, and enthusiasm will help us reach new heights!

New team members - you've joined at an exciting time. We have big plans and we're glad you'll be part of the journey!

Stop by and introduce yourself when you see a new face. Let's maintain our welcoming culture! 💫`,
      `The more, the merrier! 🎈

We're excited to announce that our hiring drive was a success! New team members are joining us this month across various departments.

Our culture of collaboration and excellence continues to attract top talent. Let's show them why this is the best place to work!

Welcome events scheduled throughout the week. Check your calendar! 🗓️`,
    ],
  },
  // Urgent/Important
  {
    category: 'urgent' as const,
    priority: 'high' as const,
    titles: [
      '⚠️ Important: System Maintenance Notice',
      '🔔 Action Required: Annual Compliance',
      '📣 Reminder: Deadline Approaching!',
    ],
    contents: [
      `Attention all employees! 🔔

Scheduled System Maintenance:
📅 Date: This Saturday
⏰ Time: 10 PM - 6 AM (Sunday)

During this time:
• Email will be unavailable
• HR Portal will be down
• VPN access limited

Please plan accordingly and save your work before the maintenance window.

Thank you for your patience! 🙏`,
      `Action Required! ⚡

Annual compliance training must be completed by end of this month.

This is mandatory for all employees. Non-compliance may affect:
• Performance reviews
• Bonus eligibility
• Certain system access

Complete the training through the Learning Portal. It takes approximately 30 minutes.

Questions? Contact HR immediately. Don't wait until the last minute! ⏰`,
      `Final Reminder! 📢

The deadline for [Annual Performance Reviews / Benefits Enrollment / Tax Documents] is approaching!

⏰ Deadline: End of this week

What you need to do:
1. Log into the HR Portal
2. Complete all required sections
3. Submit before the deadline

No extensions will be granted. Please prioritize this task.

Need help? HR is standing by! 🆘`,
    ],
  },
];

// Helper function to get random item from array
function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper function to get random boolean
function getRandomBoolean(probability = 0.3): boolean {
  return Math.random() < probability;
}

// Generate a random announcement
function generateRandomAnnouncement() {
  const template = getRandomItem(announcementTemplates);
  const title = getRandomItem(template.titles);
  const content = getRandomItem(template.contents);
  const imageUrl = getRandomBoolean(0.7) ? getRandomItem(celebrationImages) : undefined;
  const isPinned = getRandomBoolean(0.2);
  
  // Random expiration (30% chance, 7-30 days from now)
  let expiresAt: Date | undefined;
  if (getRandomBoolean(0.3)) {
    const daysFromNow = Math.floor(Math.random() * 23) + 7;
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + daysFromNow);
  }

  return {
    title,
    content,
    category: template.category,
    priority: template.priority,
    imageUrl,
    isPinned,
    expiresAt,
  };
}

export function AnnouncementSeeder({ userId, userName }: AnnouncementSeederProps) {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(1);

  const handleSeed = async () => {
    if (!userId) {
      toast.error('You must be logged in to seed announcements');
      return;
    }

    try {
      setLoading(true);
      
      for (let i = 0; i < count; i++) {
        const announcement = generateRandomAnnouncement();
        await createAnnouncement(userId, userName, announcement);
        
        // Small delay between creations to avoid overwhelming
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      toast.success(`Successfully created ${count} announcement${count > 1 ? 's' : ''}!`);
    } catch (error) {
      console.error('Error seeding announcements:', error);
      toast.error('Failed to create announcements');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-500" />
        <span className="text-sm font-medium text-purple-700">Seed Announcements</span>
      </div>
      
      <select
        value={count}
        onChange={(e) => setCount(Number(e.target.value))}
        className="rounded-lg border border-purple-200 px-3 py-1.5 text-sm bg-white focus:border-purple-500 focus:outline-none"
        disabled={loading}
      >
        <option value={1}>1</option>
        <option value={3}>3</option>
        <option value={5}>5</option>
        <option value={10}>10</option>
      </select>
      
      <Button
        onClick={handleSeed}
        disabled={loading}
        size="sm"
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Megaphone className="h-4 w-4 mr-2" />
            Generate
          </>
        )}
      </Button>
    </div>
  );
}
