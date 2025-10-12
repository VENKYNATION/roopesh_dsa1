#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

// --- Configuration ---
#define TABLE_SIZE 13           // Prime number for better hash distribution
#define MAX_KEY_LEN 30          // Max length of a skill keyword
#define MAX_SKILLS_INPUT 512    // Max length of the input skills string (e.g., "dsa, c programming")

// --- Hash Table Data Structure (DSA) ---

typedef struct KeyValuePair {
    char key[MAX_KEY_LEN];             // Skill name (already lowercased for comparison)
    int value;                         // Weight/Score
    struct KeyValuePair *next;         // Chaining for collision resolution
} KeyValuePair;

// Global array representing the Hash Table buckets
KeyValuePair *hashTable[TABLE_SIZE];

/**
 * @brief Simple Hash Function.
 * Calculates an index for the given key based on a folding technique.
 * @param key The skill string to hash.
 * @return The index in the hashTable array.
 */
unsigned int hash(const char *key) {
    unsigned int hashVal = 0;
    for (int i = 0; key[i] != '\0'; i++) {
        // Use tolower to ensure case-insensitivity in hashing
        hashVal = (hashVal * 31) + tolower((unsigned char)key[i]);
    }
    return hashVal % TABLE_SIZE;
}

/**
 * @brief Inserts a skill and its weight into the Hash Table.
 * The key is stored in lowercase.
 * @param key The skill name.
 * @param value The weight/score for the skill.
 */
void insert(const char *key, int value) {
    unsigned int index = hash(key);
    
    // Convert key to lowercase for consistent storage
    char lower_key[MAX_KEY_LEN];
    int i = 0;
    for (i = 0; key[i] != '\0' && i < MAX_KEY_LEN - 1; i++) {
        lower_key[i] = tolower((unsigned char)key[i]);
    }
    lower_key[i] = '\0';

    KeyValuePair *newPair = (KeyValuePair *)malloc(sizeof(KeyValuePair));
    if (!newPair) {
        // In a real application, proper error handling is needed. For CGI, we'll just exit.
        exit(1);
    }
    
    strncpy(newPair->key, lower_key, MAX_KEY_LEN - 1);
    newPair->key[MAX_KEY_LEN - 1] = '\0';
    newPair->value = value;
    newPair->next = hashTable[index];
    hashTable[index] = newPair;
}

/**
 * @brief Looks up a skill's weight (score) in the Hash Table.
 * @param key The skill string to look up.
 * @return The weight of the skill, or 0 if not found.
 */
int lookup(const char *key) {
    unsigned int index = hash(key);
    KeyValuePair *current = hashTable[index];

    // Convert lookup key to lowercase for comparison
    char lower_key[MAX_KEY_LEN];
    int i = 0;
    for (i = 0; key[i] != '\0' && i < MAX_KEY_LEN - 1; i++) {
        lower_key[i] = tolower((unsigned char)key[i]);
    }
    lower_key[i] = '\0';
    
    // Traverse the chain at this index
    while (current != NULL) {
        if (strcmp(current->key, lower_key) == 0) {
            return current->value;
        }
        current = current->next;
    }
    return 0; // Skill not found
}

/**
 * @brief Initializes the Hash Table with weighted keywords.
 */
void init_hash_table() {
    for (int i = 0; i < TABLE_SIZE; i++) {
        hashTable[i] = NULL;
    }

    // Populate the Hash Table with weighted skills (DSA implementation here)
    insert("c programming", 15);
    insert("dsa", 10);
    insert("hash table", 8);
    insert("algorithms", 8);
    insert("python", 7);
    insert("django", 6);
    insert("linux", 5);
    insert("data structures", 5);
    insert("cgi", 3);
    insert("mysql", 2);
}

/**
 * @brief Calculates the total score for a given comma-separated skills string.
 * It tokenizes the string and looks up each token in the Hash Table.
 * @param skills_input A comma-separated string of skills.
 * @return The final aggregate score.
 */
int calculate_score(const char *skills_input) {
    int score = 0;
    char temp_skills[MAX_SKILLS_INPUT];
    
    // Safety copy of the input string
    strncpy(temp_skills, skills_input, MAX_SKILLS_INPUT - 1);
    temp_skills[MAX_SKILLS_INPUT - 1] = '\0';

    // Tokenize the string by comma
    char *token = strtok(temp_skills, ",");
    while (token != NULL) {
        // 1. Remove leading spaces
        while(isspace((unsigned char)*token)) token++;
        
        // 2. Remove trailing spaces
        char *end = token + strlen(token) - 1;
        while(end > token && isspace((unsigned char)*end)) end--;
        *(end + 1) = '\0';

        if (strlen(token) > 0) {
            // 3. Look up the cleaned token in the Hash Table
            score += lookup(token);
        }
        token = strtok(NULL, ",");
    }
    return score;
}

/**
 * @brief Main entry point for the C program.
 * It is called by the Python CGI script and receives the skills string 
 * as a command-line argument (argv[1]).
 */
int main(int argc, char *argv[]) {
    // Check if the skills string argument was provided
    if (argc != 2) {
        // Fail silently by outputting a score of 0
        printf("0\n"); 
        return 0;
    }

    // Initialize the Hash Table
    init_hash_table();

    // Calculate the score using the Hash Table lookup
    int final_score = calculate_score(argv[1]);

    // Print the score to stdout. This is the output captured by the Python script.
    printf("%d\n", final_score);

    return 0;
}
