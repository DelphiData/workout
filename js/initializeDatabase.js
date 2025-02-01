// js/initializeDatabase.js
// ... (keep your existing Firebase imports and config)

// Add this at the end of the file
function createPopulateButton() {
    const button = document.createElement('button');
    button.textContent = 'Populate Database';
    button.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition-colors';
    button.onclick = async () => {
        button.disabled = true;
        button.textContent = 'Populating...';
        try {
            await populateDatabase();
            button.textContent = 'Database Populated!';
            setTimeout(() => {
                button.remove();
            }, 3000);
        } catch (error) {
            console.error('Error:', error);
            button.textContent = 'Error - Try Again';
            button.disabled = false;
        }
    };
    document.body.appendChild(button);
}

// Call this when the document is loaded
document.addEventListener('DOMContentLoaded', createPopulateButton);
