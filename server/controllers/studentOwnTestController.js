import User from '../models/User.js';
import Test from '../models/test.js';

// Get user performance data with detailed test information
export const studentOwnTest = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const user = await User.findById(userId)
            .populate({
                path: 'tests.test',
                select: 'testName topic type level numberOfQuestions teacherId createdAt'
            })
            .select('tests');
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found',
                data: [] // Return empty array instead of undefined
            });
        }

        // Ensure tests exists and is an array
        const tests = user.tests || [];
        
        const performanceData = tests.map(testEntry => {
            const test = testEntry.test || {};
            
            return {
                testId: test._id,
                testName: test.testName,
                topic: test.topic,
                type: test.type,
                level: test.level,
                teacherId: test.teacherId,
                score: testEntry.totalQuestions ? 
                    Math.round((testEntry.correctAnswers / testEntry.totalQuestions) * 100) : 0,
                correctAnswers: testEntry.correctAnswers || 0,
                totalQuestions: testEntry.totalQuestions || test.numberOfQuestions || 0,
                timeTaken: testEntry.timeTaken || 0,
                attemptedAt: testEntry.attemptedAt || new Date(),
                status: testEntry.status || 'unknown',
                testCreatedAt: test.createdAt
            };
        });

        res.json({
            success: true,
            count: performanceData.length,
            data: performanceData // Always an array
        });
        
    } catch (error) {
        console.error('Error fetching performance data:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch performance data',
            data: [], // Return empty array on error
            error: error.message 
        });
    }
};