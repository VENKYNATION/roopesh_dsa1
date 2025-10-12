#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define MAX_LEN 1024
#define MAX_USERNAME_LEN 100
#define MAX_PASSWORD_LEN 100
#define MAX_ROLE_LEN 20

// Function to decode URL-encoded characters (like + to space)
void url_decode(char *str) {
    char *p = str;
    char hex[3] = {0};
    int i = 0;
    while (*p) {
        if (*p == '+') {
            *str = ' ';
        } else if (*p == '%') {
            if (strlen(p) >= 3) {
                hex[0] = p[1];
                hex[1] = p[2];
                *str = (char)strtol(hex, NULL, 16);
                p += 2;
            }
        } else {
            *str = *p;
        }
        str++;
        p++;
    }
    *str = '\0';
}

/**
 * @brief Extracts a form field value from the POST data string.
 * This is a fundamental utility for C CGI applications.
 * @param data The raw POST data string (e.g., "username=user&password=pass").
 * @param name The name of the field to extract (e.g., "username").
 * @param output The buffer to store the extracted, URL-decoded value.
 * @param max_len The maximum size of the output buffer.
 * @return 1 on success, 0 on failure.
 */
int extract_field(const char *data, const char *name, char *output, size_t max_len) {
    char search_key[MAX_LEN];
    snprintf(search_key, MAX_LEN, "%s=", name);

    char *pos = strstr(data, search_key);
    if (!pos) return 0;
    
    pos += strlen(search_key);
    
    char *end = strchr(pos, '&');
    size_t len = end ? (size_t)(end - pos) : strlen(pos);
    
    if (len >= max_len) len = max_len - 1;

    // Copy the raw value
    strncpy(output, pos, len);
    output[len] = '\0';

    // Decode URL-encoded characters
    url_decode(output);
    
    return 1;
}

/**
 * @brief Checks if a user exists in ../user.txt and loads credentials if found.
 * @param username The username to check.
 * @param found_password Buffer to store the password if found.
 * @param found_role Buffer to store the role if found.
 * @return 1 if user exists, 0 otherwise.
 */
int check_user(const char *username, char *found_password, char *found_role) {
    // Note: The C executable in cgi-bin/ needs to access ../style/user.txt
    // Since the output HTML files are in style/, we assume user.txt is also in style/
    FILE *fp = fopen("../style/user.txt", "r");
    if (!fp) return 0; // File does not exist or cannot be opened

    char line[MAX_LEN];
    char usr[MAX_USERNAME_LEN], pwd[MAX_PASSWORD_LEN], rl[MAX_ROLE_LEN];
    int found = 0;

    while (fgets(line, sizeof(line), fp)) {
        // Use sscanf to safely parse data separated by '|'
        if (sscanf(line, "%99[^|]|%99[^|]|%19[^ \n]", usr, pwd, rl) == 3) {
            if (strcmp(usr, username) == 0) {
                strncpy(found_password, pwd, MAX_PASSWORD_LEN);
                strncpy(found_role, rl, MAX_ROLE_LEN);
                found = 1;
                break;
            }
        }
    }
    fclose(fp);
    return found;
}

/**
 * @brief Adds a new user record to ../style/user.txt.
 */
void add_user(const char *username, const char *password, const char *role) {
    // Append mode to add to the end of the file
    FILE *fp = fopen("../style/user.txt", "a");
    if (fp) {
        fprintf(fp, "%s|%s|%s\n", username, password, role);
        fclose(fp);
    }
}

/**
 * @brief Main function that acts as the CGI handler.
 */
int main() {
    // 1. Check Request Method
    char *request_method = getenv("REQUEST_METHOD");
    if (!request_method || strcmp(request_method, "POST") != 0) {
        printf("Content-type: text/html\n\n");
        printf("<html><body><h2>Error</h2><p>Only POST requests are allowed.</p></body></html>");
        return 0;
    }

    // 2. Read POST Data
    int len = 0;
    char *content_length = getenv("CONTENT_LENGTH");
    if (content_length) {
        len = atoi(content_length);
    }

    char *post_data = NULL;
    if (len > 0 && len < MAX_LEN) {
        post_data = (char *)malloc(len + 1);
        if (post_data) {
            if (fread(post_data, 1, len, stdin) != len) {
                free(post_data);
                post_data = NULL;
            } else {
                post_data[len] = '\0';
            }
        }
    }

    printf("Content-type: text/html\n\n");
    printf("<html><head><title>Authentication Status</title></head><body>");
    printf("<div style='max-width: 600px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; font-family: sans-serif;'>");
    
    if (!post_data) {
        printf("<h2>Error</h2><p>No data received.</p>");
    } else {
        char username[MAX_USERNAME_LEN] = {0};
        char password[MAX_PASSWORD_LEN] = {0};
        char role[MAX_ROLE_LEN] = {0};
        char action[10] = {0};

        extract_field(post_data, "username", username, sizeof(username));
        extract_field(post_data, "password", password, sizeof(password));
        extract_field(post_data, "role", role, sizeof(role));
        extract_field(post_data, "action", action, sizeof(action));
        
        free(post_data); // Free the dynamic memory

        if (strlen(username) == 0 || strlen(password) == 0) {
            printf("<h2>Error</h2><p>Username or password cannot be empty. <a href='../style/index.html'>Back</a></p>");
        } else {
            char found_password[MAX_PASSWORD_LEN] = {0};
            char found_role[MAX_ROLE_LEN] = {0};
            int exists = check_user(username, found_password, found_role);

            if (strcmp(action, "signup") == 0) {
                if (exists) {
                    printf("<h2>Signup Failed</h2><p>User <b>%s</b> already exists. Please <a href='../style/index.html'>login</a>.</p>", username);
                } else {
                    add_user(username, password, role);
                    printf("<h2>Signup Successful</h2><p>Welcome <b>%s</b>! You are registered as <b>%s</b>.</p>", username, role);
                    
                    if (strcmp(role, "employee") == 0)
                        printf("<p><a href='../style/submit_resume.html'>Proceed to Submit Resume</a></p>");
                    else if (strcmp(role, "hr") == 0)
                        printf("<p><a href='../style/hr_bashboard.html'>Proceed to HR Dashboard</a></p>");
                }
            } else if (strcmp(action, "login") == 0) {
                if (!exists || strcmp(password, found_password) != 0) {
                    printf("<h2>Login Failed</h2><p>Invalid credentials. Please check your username and password. <a href='../style/index.html'>Back</a></p>");
                } else {
                    printf("<h2>Login Successful</h2><p>Welcome back, <b>%s</b>! Logged in as <b>%s</b>.</p>", username, found_role);
                    
                    if (strcmp(found_role, "employee") == 0)
                        printf("<p><a href='../style/submit_resume.html'>Submit Resumes</a></p>");
                    else if (strcmp(found_role, "hr") == 0)
                        printf("<p><a href='../style/hr_bashboard.html'>HR Dashboard</a></p>");
                }
            } else {
                 printf("<h2>Error</h2><p>Invalid action requested. <a href='../style/index.html'>Back</a></p>");
            }
        }
    }

    printf("</div></body></html>");

    return 0;
}
