'use client';

import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function UserIdLogger() {
  useEffect(() => {
    const logUserId = async () => {
      const supabase = createClientComponentClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const uid = session.user.id;
        console.error('\x1b[36m%s\x1b[0m', '🔑 Current User UID:', uid); // Cyan color with emoji
      } else {
        console.error('\x1b[33m%s\x1b[0m', '⚠️ No user is currently logged in'); // Yellow color with emoji
      }
    };

    logUserId();
  }, []);

  return null; // This component doesn't render anything
} 