const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const USER_EMAIL = 'loadtest@example.com';
const USER_PASSWORD = 'Password123!';
const ORG_ID = '00000000-0000-0000-0000-000000000001'; // Ensure this exists in your DB

async function runLoadTest() {
    try {
        console.log('--- Phase 1: Authentication ---');
        let token;
        try {
            const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
                email: USER_EMAIL,
                password: USER_PASSWORD
            });
            token = loginRes.data.accessToken;
            console.log('Logged in successfully');
        } catch (e) {
            console.log('Login failed, trying registration...');
            const regRes = await axios.post(`${BASE_URL}/auth/register`, {
                email: USER_EMAIL,
                password: USER_PASSWORD,
                firstName: 'Load',
                lastName: 'Test',
                organizationId: ORG_ID
            });
            token = regRes.data.accessToken;
            console.log('Registered and logged in');
        }

        const authHeaders = { Authorization: `Bearer ${token}` };

        console.log('\n--- Phase 2: Start Session ---');
        const sessionRes = await axios.post(`${BASE_URL}/sessions/start`, {
            task: 'Load Testing Concurrency',
            description: 'Testing 100 parallel activity updates'
        }, { headers: authHeaders });

        const sessionId = sessionRes.data.id;
        console.log(`Session started: ${sessionId}`);

        console.log('\n--- Phase 3: Parallel Activity Ingestion ---');
        const numUpdates = 100;
        const updates = [];
        const startTime = Date.now();

        for (let i = 0; i < numUpdates; i++) {
            updates.push(
                axios.post(`${BASE_URL}/sessions/${sessionId}/activity`, {
                    type: i % 2 === 0 ? 'active' : 'idle',
                    action: `Activity update ${i}`,
                    timestamp: startTime + (i * 1000) // 1 second intervals
                }, { headers: authHeaders })
            );
        }

        console.log(`Sending ${numUpdates} parallel updates...`);
        const results = await Promise.allSettled(updates);

        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const failCount = results.filter(r => r.status === 'rejected').length;
        console.log(`Finished: ${successCount} succeeded, ${failCount} failed`);

        console.log('\n--- Phase 4: Stop Session ---');
        await axios.post(`${BASE_URL}/sessions/${sessionId}/stop`, {}, { headers: authHeaders });
        console.log('Session stopped');

        console.log('\n--- Phase 5: Verification ---');
        const verifyRes = await axios.get(`${BASE_URL}/sessions/${sessionId}`, { headers: authHeaders });
        const finalSession = verifyRes.data;

        console.log('Final Session Totals:');
        console.log(`- Duration: ${finalSession.duration}s`);
        console.log(`- Active: ${finalSession.activeSeconds}s`);
        console.log(`- Idle: ${finalSession.idleSeconds}s`);
        console.log(`- DB Version: ${finalSession.version}`);

        // Since we sent 100 updates with 1s gaps, total should be around 100s
        if (finalSession.duration >= 99 && finalSession.duration <= 101) {
            console.log('✅ TEST PASSED: Duration is accurate despite concurrency');
        } else {
            console.log('❌ TEST FAILED: Duration mismatch');
        }

    } catch (error) {
        console.error('Test Execution Error:', error.response?.data || error.message);
    }
}

runLoadTest();
