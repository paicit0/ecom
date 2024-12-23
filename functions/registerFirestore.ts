import functions from 'firebase-functions';
import admin from 'firebase-admin';
import bcrypt from 'bcryptjs';

export const registerFirestore = functions.https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const { username, password }: { username: string; password: string } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await admin.firestore().collection('users').add({
            createAt: admin.firestore.FieldValue.serverTimestamp(),
            username,
            password: hashedPassword,
        });

        res.status(200).send({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send({ error: 'Error registering user' });
    }
    return;
});

