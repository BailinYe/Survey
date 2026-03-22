import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

// 获取 Firestore 实例
const surveyData = {
  "surveys": {
    "survey_001": {
      "id": "survey_001",
      "authorId": "user_1001",
      "createdAt": {"_seconds": 1705307400, "_nanoseconds": 0},
      "updatedAt": {"_seconds": 1705307400, "_nanoseconds": 0},
      "title": "Customer Satisfaction Survey",
      "description": "Gather feedback on product usability and overall experience",
      "status": "active",
      "questionCount": 10
    },
    "survey_002": {
      "id": "survey_002",
      "authorId": "user_1002",
      "createdAt": {"_seconds": 1708428900, "_nanoseconds": 0},
      "updatedAt": {"_seconds": 1708593900, "_nanoseconds": 0},
      "title": "Employee Wellness Assessment",
      "description": "Understand employee mental health and work-life balance needs",
      "status": "closed",
      "questionCount": 8
    },
    "survey_003": {
      "id": "survey_003",
      "authorId": "user_1001",
      "createdAt": {"_seconds": 1709628000, "_nanoseconds": 0},
      "updatedAt": {"_seconds": 1709628000, "_nanoseconds": 0},
      "title": "Product Feature Request Survey",
      "description": "Identify user needs for upcoming product updates",
      "status": "active",
      "questionCount": 12
    },
    "survey_004": {
      "id": "survey_004",
      "authorId": "user_1003",
      "createdAt": {"_seconds": 1712983200, "_nanoseconds": 0},
      "updatedAt": {"_seconds": 1713242400, "_nanoseconds": 0},
      "title": "E-commerce Shopping Experience Survey",
      "description": "Evaluate user journey from browsing to checkout",
      "status": "active",
      "questionCount": 15
    },
    "survey_005": {
      "id": "survey_005",
      "authorId": "user_1004",
      "createdAt": {"_seconds": 1715143800, "_nanoseconds": 0},
      "updatedAt": {"_seconds": 1715143800, "_nanoseconds": 0},
      "title": "Software Onboarding Feedback",
      "description": "Collect insights on new user onboarding process",
      "status": "active",
      "questionCount": 7
    },
    "survey_006": {
      "id": "survey_006",
      "authorId": "user_1002",
      "createdAt": {"_seconds": 1718700600, "_nanoseconds": 0},
      "updatedAt": {"_seconds": 1718854500, "_nanoseconds": 0},
      "title": "Remote Work Effectiveness Survey",
      "description": "Assess productivity and challenges of remote work setup",
      "status": "closed",
      "questionCount": 11
    },
    "survey_007": {
      "id": "survey_007",
      "authorId": "user_1005",
      "createdAt": {"_seconds": 1720005900, "_nanoseconds": 0},
      "updatedAt": {"_seconds": 1720005900, "_nanoseconds": 0},
      "title": "Marketing Campaign Performance Survey",
      "description": "Measure audience response to Q3 2024 marketing campaigns",
      "status": "active",
      "questionCount": 9
    },
    "survey_008": {
      "id": "survey_008",
      "authorId": "user_1001",
      "createdAt": {"_seconds": 1723350600, "_nanoseconds": 0},
      "updatedAt": {"_seconds": 1723441800, "_nanoseconds": 0},
      "title": "Educational Platform Usability Test",
      "description": "Gather student feedback on online learning tools",
      "status": "active",
      "questionCount": 14
    },
    "survey_009": {
      "id": "survey_009",
      "authorId": "user_1006",
      "createdAt": {"_seconds": 1727008200, "_nanoseconds": 0},
      "updatedAt": {"_seconds": 1727008200, "_nanoseconds": 0},
      "title": "Customer Retention Survey",
      "description": "Identify reasons for customer churn and retention opportunities",
      "status": "active",
      "questionCount": 13
    },
    "survey_010": {
      "id": "survey_010",
      "authorId": "user_1003",
      "createdAt": {"_seconds": 1728131100, "_nanoseconds": 0},
      "updatedAt": {"_seconds": 1728290100, "_nanoseconds": 0},
      "title": "Mobile App Performance Survey",
      "description": "Evaluate app speed, stability and user experience",
      "status": "closed",
      "questionCount": 6
    }
  }
};

export async function importSurveyData() {
  const surveysCollectionRef = collection(db, "surveys");

  for (const surveyId in surveyData.surveys) {
    if (surveyData.surveys.hasOwnProperty(surveyId)) {
      const survey = surveyData.surveys[surveyId];

      // 将 createdAt 和 updatedAt 字段转换为 Firestore Timestamp 对象
      const formattedSurvey = {
        ...survey,
        createdAt: new Timestamp(survey.createdAt._seconds, survey.createdAt._nanoseconds),
        updatedAt: new Timestamp(survey.updatedAt._seconds, survey.updatedAt._nanoseconds)
      };

      try {
        await setDoc(doc(surveysCollectionRef, surveyId), formattedSurvey);
        console.log(`Document with ID: ${surveyId} successfully written!`);
      } catch (e) {
        console.error(`Error adding document ${surveyId}: `, e);
      }
    }
  }
}

