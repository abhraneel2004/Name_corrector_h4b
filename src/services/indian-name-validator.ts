'use client';

/**
 * Represents information about a name, including its validity.
 */
export interface NameInfo {
  /**
   * Indicates whether the name is valid or not.
   */
  isValid: boolean;
  /**
   * An optional message providing additional information about the name.
   */
  message?: string;
  /**
   * An optional suggested correction for an invalid name.
   */
  suggestion?: string;
}

/**
 * Represents a name correction entry
 */
export interface NameCorrection {
  /**
   * The original name
   */
  original: string;
  /**
   * The corrected name
   */
  corrected: string;
  /**
   * Whether a correction was made
   */
  needsCorrection: boolean;
  /**
   * Optional reason for the correction
   */
  reason?: string;
}

// List of common Indian first names and last names for validation
const commonIndianFirstNames = [
  "Aarav", "Aditya", "Advik", "Agastya", "Akshay", "Amol", "Anant", "Anay", "Aniket", "Anish",
  "Ankit", "Ankur", "Anmol", "Anoop", "Anupam", "Arjun", "Arnav", "Aryan", "Atharv", "Ayaan",
  "Ayush", "Badal", "Bhavin", "Bhavya", "Chaitanya", "Chakradhar", "Chandan", "Chandran", "Chetan", "Chirag",
  "Daiwik", "Daksh", "Darsh", "Darshan", "Dev", "Devesh", "Dhruv", "Dinesh", "Divit", "Divyesh",
  "Eeshan", "Ekansh", "Eklavya", "Ezra", "Faiyaz", "Farhan", "Fateh", "Gaurav", "Gautam", "Girish",
  "Gopal", "Govind", "Gyan", "Harish", "Harsh", "Harshad", "Harshil", "Hemant", "Himanshu", "Hitesh",
  "Hridaan", "Hriday", "Ishan", "Ishaan", "Jai", "Jayant", "Jayesh", "Jeevan", "Jivin", "Kabir",
  "Kalpit", "Kamal", "Karan", "Kartik", "Keshav", "Kiaan", "Kishan", "Krishna", "Krish", "Krishiv",
  "Kunal", "Lakshay", "Lakshya", "Lalit", "Luv", "Madhav", "Manan", "Manav", "Manish", "Manjeet",
  "Manoj", "Mayank", "Mihir", "Milan", "Mohit", "Moksh", "Mukesh", "Naman", "Naresh", "Narendra",
  "Naveen", "Neel", "Neeraj", "Nihal", "Nikhil", "Nil", "Nilesh", "Nirav", "Nishant", "Nitesh",
  "Nivan", "Om", "Omkar", "Paras", "Parth", "Piyush", "Pradeep", "Prakash", "Pranav", "Pranay",
  "Prasad", "Pratham", "Pratik", "Pratyush", "Prem", "Pritish", "Priyanshu", "Punit", "Rahul", "Raj",
  "Rajeev", "Rajesh", "Rajiv", "Rakesh", "Ram", "Ramesh", "Ranbir", "Ranveer", "Rashmi", "Ravi",
  "Ravindra", "Rehan", "Rishi", "Ritesh", "Ritvik", "Rohan", "Rohit", "Ronit", "Rudra", "Rushil",
  "Saatvik", "Sachin", "Sahil", "Samar", "Samarth", "Samay", "Sanjay", "Sanjeev", "Sarthak", "Satish",
  "Saurabh", "Shaan", "Shankar", "Shantanu", "Shaurya", "Shivam", "Shubham", "Shyam", "Siddharth", "Soham",
  "Sohum", "Sourav", "Srinivas", "Subhash", "Sudhir", "Sumedh", "Sumit", "Sunil", "Suraj", "Surya",
  "Swapnil", "Tarun", "Tejas", "Tushar", "Udayan", "Ujjwal", "Umang", "Uttam", "Vaibhav", "Vandan",
  "Veer", "Vihaan", "Vikas", "Vikram", "Vimal", "Vinay", "Vineet", "Vinod", "Vipul", "Viraj",
  "Vishal", "Vishnu", "Vivaan", "Vivek", "Yash", "Yatin", "Yogesh", "Yuvaan", "Yuvan", "Zayan",
  "Abhay", "Abhijit", "Abhinav", "Abimanyu", "Abir", "Achintya", "Adhiraj", "Advait", "Agrim", "Ajay",
  "Ajeet", "Akash", "Akul", "Amandeep", "Amardeep", "Ambuj", "Ameya", "Amish", "Ananya", "Ansh",
  "Anshul", "Apoorv", "Aradhya", "Arihant", "Arjun", "Ashish", "Ashok", "Ashwin", "Atharva", "Atiksh",
  "Avaneesh", "Avinash", "Ayush", "Azad", "Baldev", "Basu", "Bharat", "Bhargav", "Bhaskar", "Brijesh",
  "Chakshu", "Chanakya", "Chandrashekhar", "Charan", "Chauhan", "Darshan", "Dayaal", "Debashish", "Deepak", "Devansh",
  "Devendra", "Dhairya", "Dhananjay", "Dharmendra", "Dheeraj", "Dhyan", "Digvijay", "Dilip", "Divij", "Ehsaan",
  "Ekaant", "Ekansh", "Eklavya", "Faisal", "Farid", "Firoz", "Gagan", "Ganesh", "Gaurang", "Geet",
  "Gopal", "Gopinath", "Gurdeep", "Gurpreet", "Harihar", "Harinder", "Harman", "Harpreet", "Harsh", "Harshvardhan",
  "Hemanth", "Hemendra", "Himmat", "Hridhaan", "Hrithik", "Ibrahim", "Indrajit", "Indraneel", "Indranil", "Ishwar",
  "Jagadish", "Jagdish", "Jagjit", "Jai", "Jaideep", "Jaidev", "Jaiveer", "Janak", "Jarnail", "Jaskirat",
  "Jaswinder", "Jatin", "Jatinder", "Jayadev", "Jayant", "Jayendra", "Jeetendra", "Jigme", "Jitendra", "Jivesh",
  "Johar", "Jujhar", "Jyotiraditya", "Kabir", "Kailash", "Kalyan", "Kamaldeep", "Kamlesh", "Kanak", "Kanishk",
  "Kapil", "Karan", "Kartikeya", "Kaustubh", "Keshav", "Keyur", "Khushal", "Kiran", "Kirti", "Koushik",
  "Krishan", "Krishna", "Kunal", "Kunwar", "Kushal", "Laksh", "Lakshit", "Lakshman", "Laxman", "Lohit",
  "Madhur", "Madhusudan", "Mahavir", "Mahendra", "Mahesh", "Manas", "Mandar", "Mangesh", "Maninder", "Manmohan",
  "Manvendra", "Mayur", "Mihir", "Milind", "Mitesh", "Mohan", "Mukul", "Murali", "Naadir", "Nachiketa",
  "Nachiket", "Nagendra", "Nakul", "Nanak", "Narain", "Narayan", "Navdeep", "Navjot", "Navodit", "Navtej",
  "Nayan", "Neelkanth", "Neev", "Neevan", "Nehal", "Niam", "Nihar", "Nikhil", "Nikunj", "Nilam",
  "Nilesh", "Ninad", "Niraj", "Niranjan", "Nirav", "Nirmit", "Nishad", "Nishit", "Nithin", "Nityanand",
  "Niyam", "Ojus", "Omkar", "Osman", "Padmanabha", "Palash", "Pankaj", "Parminder", "Parth", "Parthasarathy",
  "Pavan", "Piyush", "Prabal", "Prabhat", "Praful", "Prajwal", "Pramod", "Pranit", "Prashant", "Prasoon",
  "Pratyush", "Praveen", "Prayag", "Priyansh", "Pulkit", "Purushottam", "Pushkar", "Raghav", "Raghu", "Raghuveer",
  "Rajat", "Rajeev", "Rajendra", "Rajeshwar", "Rajnish", "Rajveer", "Rakshit", "Ramakrishna", "Ramana", "Ramanuj",
  "Ramchandra", "Rameshwar", "Ranbir", "Randhir", "Ranjeet", "Ranvijay", "Ratan", "Ratnesh", "Ravikiran", "Reyansh",
  "Rishabh", "Rishit", "Ritik", "Ritwik", "Rochak", "Rohaan", "Rohitash", "Romil", "Rudraksh", "Rupal",
  "Rushabh", "Rushil", "Ruthvik", "Saahas", "Saahil", "Saakaar", "Saatvik", "Sachit", "Sagar", "Sahaj",
  "Saharsh", "Saksham", "Samanyu", "Samarjit", "Samesh", "Samit", "Samrat", "Sanatan", "Sandeep", "Sangram",
  "Sanjeet", "Sankalp", "Sanket", "Santosh", "Sarang", "Saransh", "Sarvesh", "Satinder", "Satvik", "Satwik",
  "Saumya", "Savar", "Sehaj", "Shahid", "Shailendra", "Shamik", "Shankar", "Sharan", "Shashank", "Shashwat",
  "Shaswat", "Shaunak", "Shekhar", "Shivansh", "Shivendra", "Shrey", "Shreyas", "Shrivatsa", "Shubhankar", "Shyamal",
  "Siddhartha", "Sidharth", "Smaran", "Snehal", "Somesh", "Somnath", "Srijan", "Srikant", "Srinath", "Sriram",
  "Srivas", "Subodh", "Sudhansh", "Sudhanshu", "Sudhanva", "Sugam", "Sujay", "Sukant", "Sumantra", "Sumeet",
  "Sumit", "Sundar", "Suneet", "Suraj", "Suramya", "Suresh", "Surya", "Sushant", "Swarnava", "Swayam",
  "Tarang", "Tarush", "Tejasvi", "Thakur", "Tribhuvan", "Trilok", "Trishan", "Udai", "Uday", "Udith",
  "Ujjawal", "Ujjwal", "Umaid", "Upendra", "Utkarsh", "Uttej", "Vandan", "Vardaan", "Vasu", "Vedant",
  "Vedanth", "Veer", "Vidhaan", "Vidur", "Vihar", "Vijay", "Vimal", "Vinayak", "Vipul", "Viraaj",
  "Virat", "Vishaal", "Vishesh", "Vishwajeet", "Vishwas", "Vivaan", "Vivek", "Vyom", "Yakshit", "Yaman",
  "Yashasvi", "Yashodhara", "Yashovardhan", "Yatin", "Yuvraj", "Akshat", "Ambar", "Avnish", "Balraj", "Chandresh",
  "Chatresh", "Dakshesh", "Deepesh", "Devarsh", "Dharmik", "Dhavan", "Dishant", "Drishtant", "Dushyant", "Elesh",
  "Giriraj", "Guneet", "Hardik", "Hargun", "Harshal", "Hemish", "Hitanshu", "Hreday", "Jairaj", "Jinay",
  "Kaartik", "Kanhaiya", "Karnaveer", "Karnik", "Kaushal", "Ketan", "Kushaagra", "Lakshan", "Lavesh", "Magan",
  "Maitreya", "Malhar", "Mandar", "Manik", "Mehtab", "Mitansh", "Mitul", "Mohak", "Monik", "Mrinal",
  "Nakshatra", "Nandish", "Navya", "Neelansh", "Neer", "Nimish", "Nimit", "Nirant", "Nishkarsh", "Nishith",
  "Nivaan", "Ojas", "Onkar", "Paavan", "Paarth", "Palash", "Parimal", "Paritosh", "Parixit", "Parshva",
  "Parth", "Parthiv", "Pavak", "Prabodh", "Praneel", "Pranit", "Pratit", "Pravir", "Prerith", "Priyadarshi",
  "Puneet", "Raghunath", "Rajbir", "Rajdeep", "Rajvansh", "Raman", "Ramit", "Rannvijay", "Raunak", "Rehan",
  "Rehaan", "Revanth", "Ribhav", "Ridhiman", "Rihaan", "Rishaab", "Rishaan", "Rishav", "Riyaan", "Ronith",
  "Rudhir", "Rupin", "Rushank", "Ruturaj", "Saarang", "Sabhya", "Sachiv", "Sahas", "Saiansh", "Sairaj",
  "Samaksh", "Samarpan", "Sambhav", "Samridh", "Sanat", "Sanchit", "Sandesh", "Sanidhya", "Sanjiv", "Sanmay",
  "Sarvansh", "Sathvik", "Saumil", "Saurav", "Sayantan", "Shanmukh", "Shaunak", "Shiven", "Shivin", "Shourya",
  "Shreyansh", "Shreyash", "Shuban", "Sidak", "Smayan", "Sohail", "Soham", "Souhardya", "Srikhar", "Sriman",
  "Srivatsan", "Subhankar", "Sudhanva", "Sukrit", "Sunand", "Sushil", "Swagat", "Swarn", "Taarin", "Tanay",
  "Tanish", "Tanmay", "Tanuj", "Tanveer", "Taran", "Tariq", "Tathagata", "Tauren", "Tavish", "Teerthankar",
  "Tejus", "Tulsi", "Ujesh", "Unmesh", "Vaaman", "Vaidik", "Vaishakh", "Vajra", "Vansh", "Vardhan",
  "Varun", "Vedang", "Venkat", "Viaan", "Vijit", "Vikrant", "Vimanyu", "Vinesh", "Vipin", "Viraj",
  "Visaj", "Vishrut", "Vivaan", "Yajat", "Yaman", "Yashvant", "Yatin", "Yug", "Yugank", "Yugansh",
  "Aahan", "Aakash", "Aamir", "Aanand", "Aarnav", "Aarush", "Aayush", "Abhigyan", "Abhilash", "Abhimanyu",
  "Abhinn", "Abhiroop", "Abhishek", "Abiram", "Adarsh", "Advay", "Advit", "Ajeya", "Akshit", "Alok",
  "Amal", "Aman", "Amey", "Amol", "Amrit", "Amulya", "Anagh", "Anandh", "Ananmay", "Anant",
  "Anbumani", "Anik", "Aniruddh", "Anuj", "Anuraag", "Anvay", "Apramey", "Archit", "Arihan", "Arin",
  "Arpit", "Arshia", "Arth", "Artham", "Arun", "Aryan", "Atiksh", "Atul", "Ayog", "Azaan",
  "Bageshri", "Bahadur", "Bhaanu", "Bhadra", "Bharath", "Bhaumik", "Bhupathi", "Brahma", "Brahmdeep", "Brijmohan",
  "Chakshu", "Chakshu", "Champak", "Chandan", "Chandradeep", "Chandramouli", "Chandrasekar", "Cheran", "Chirayu", "Chirenjiv",
  "Daksha", "Damodhar", "Daulat", "Dayaanidhi", "Debjit", "Deekshith", "Deepshankar", "Deeptanshu", "Devarajan", "Devarsi",
  "Devdas", "Devvrat", "Dhanvin", "Dharmendra", "Dhatri", "Dheeran", "Dhrishit", "Dhyanesh", "Digambar", "Dilbagh",
  "Divyansh", "Divyanshu", "Divyendu", "Eeshaan", "Eeshwar", "Ekansh", "Ekalavya", "Eshwar", "Eswar", "Fadil",
  "Fareed", "Farhan", "Fatik", "Gajendra", "Gambhir", "Ganadhipa", "Gandharva", "Ganesh", "Gantavya", "Garv",
  "Gaurd", "Gaurav", "Gautam", "Girik", "Girindra", "Gomathy", "Gopaal", "Gopesh", "Gouraang", "Govardhan",
  "Gulab", "Gunbir", "Guneet", "Gursharan", "Gyaanik", "Hakesh", "Hargun", "Harith", "Harkeerat", "Harman",
  "Harnoor", "Harshaali", "Harshavardhana", "Harshit", "Harshal", "Hasith", "Hemanth", "Hemendra", "Hiren", "Hiyank",
  "Aadhya", "Aanya", "Aaradhya", "Aarna", "Aarushi", "Aarya", "Aashvi", "Aastha", "Aditi", "Advika", 
  "Ahana", "Akshara", "Amara", "Amrita", "Amyra", "Anaisha", "Ananya", "Anaya", "Anika", "Anushka", 
  "Anvi", "Anya", "Aparajita", "Aparna", "Aria", "Arya", "Ashwini", "Avani", "Avni", "Avya", 
  "Bela", "Bhavana", "Bhavika", "Bhumika", "Chandni", "Charvi", "Darshana", "Deepa", "Deepika", "Dev", 
  "Devika", "Devi", "Dhanya", "Dhara", "Dhriti", "Disha", "Divya", "Diya", "Drishti", "Drishya", 
  "Eesha", "Esha", "Falguni", "Garima", "Gayatri", "Geetika", "Gita", "Harini", "Harshita", "Hema", 
  "Hemani", "Hina", "Indira", "Ira", "Iravati", "Isha", "Ishani", "Ishika", "Ishita", "Janya", 
  "Jasmine", "Jasmita", "Jhanvi", "Jharna", "Juhi", "Jyoti", "Jyotsana", "Kaira", "Kajal", "Kajol", 
  "Kalpana", "Kamala", "Kamini", "Kanak", "Kanchana", "Kanisha", "Kanta", "Kareena", "Karishma", "Karuna",
  "Kasturi", "Kaveri", "Kavita", "Kavya", "Keerthi", "Kinjal", "Kirti", "Kriti", "Kritika", "Krupa", 
  "Kshama", "Kumari", "Kunti", "Kyra", "Lakshmi", "Lalita", "Lavanya", "Leela", "Lekha", "Lila", 
  "Lipi", "Madhavi", "Madhura", "Madhuri", "Mahika", "Mahima", "Mallika", "Manasi", "Manisha", "Manjari", 
  "Manjula", "Manjusha", "Manya", "Maya", "Mayuri", "Medha", "Meera", "Megha", "Meghana", "Mira", 
  "Mitali", "Mitra", "Mohini", "Monica", "Mukti", "Myra", "Naina", "Nalini", "Namita", "Namya", 
  "Nandini", "Nandita", "Naomi", "Navya", "Nehrika", "Neha", "Nidhi", "Niharika", "Nikita", "Nila", 
  "Nilima", "Nimisha", "Nisha", "Nishi", "Nitya", "Niyati", "Ojaswi", "Omisha", "Opal", "Padma", 
  "Padmini", "Pallavi", "Pankaja", "Paridhi", "Parinita", "Pavana", "Pinky", "Pooja", "Poonam", "Prabha", 
  "Pragya", "Pratibha", "Pratiksha", "Pravina", "Preeti", "Prema", "Prerna", "Prisha", "Priti", "Priya", 
  "Priyanka", "Puja", "Punita", "Pushpa", "Rachana", "Rachita", "Radha", "Radhika", "Ragini", "Rajani", 
  "Rajni", "Rajshree", "Rakhi", "Ramya", "Rani", "Rashmi", "Ratna", "Rekha", "Renu", "Revati", 
  "Rhea", "Riddhi", "Rishika", "Riya", "Rohini", "Roopa", "Ruchika", "Ruchi", "Rudra", "Rukmini", 
  "Rupal", "Rupali", "Saanvi", "Sachi", "Sadhana", "Sahana", "Sahasra", "Saisha", "Sakshi", "Samiksha", 
  "Samridhi", "Sandhya", "Sangita", "Saniya", "Sanjna", "Sanjula", "Saraswati", "Sarika", "Sarisha", "Saumya", 
  "Savitri", "Seema", "Selvi", "Shanaya", "Shanti", "Sharmila", "Shashi", "Sheetal", "Shilpa", "Shivani", 
  "Shraddha", "Shreya", "Shubha", "Shweta", "Sia", "Siddhi", "Simran", "Sindhu", "Sita", "Sneha", 
  "Sonakshi", "Sonia", "Srija", "Srishti", "Subhadra", "Subhashini", "Sucheta", "Sudha", "Sujata", "Sukanya", 
  "Suma", "Suman", "Sumati", "Sumitra", "Sunaina", "Sunanda", "Sunidhi", "Sunita", "Supriya", "Surabhi", 
  "Surekha", "Surya", "Susmita", "Swara", "Swarna", "Swati", "Swetha", "Tanisha", "Tanmayi", "Tanushri", 
  "Tanvi", "Tanya", "Tapasya", "Tara", "Tarini", "Tejaswini", "Triveni", "Tulsi", "Uma", "Upasana", 
  "Urvi", "Usha", "Uttara", "Vaishnavi", "Vaishvi", "Vandana", "Vanshika", "Varsha", "Vasudha", "Vasundhara", 
  "Vedika", "Vidhi", "Vidya", "Vijaya", "Vimala", "Vinaya", "Vrinda", "Yamini", "Yashoda", "Yashodhara", 
  "Yasmeen", "Yasmin", "Yogita", "Yoshita", "Zara", "Advita", "Aadhira", "Aaliyah", "Aahana", "Aaina", 
  "Aalia", "Aaloka", "Abhilasha", "Adhira", "Adya", "Agrata", "Ahalya", "Ahilya", "Aishani", "Akanksha", 
  "Akshita", "Alaknanda", "Alisha", "Alvira", "Amani", "Amisha", "Amoda", "Amolika", "Amulya", "Anala", 
  "Anamika", "Anandita", "Anandi", "Anchal", "Anjali", "Anjana", "Anjika", "Anjuli", "Anmol", "Annapurna", 
  "Anshu", "Anuradha", "Anusha", "Anwesha", "Arati", "Aradhana", "Arathi", "Archana", "Ardra", "Arunima", 
  "Asha", "Ashima", "Ashmita", "Avantika", "Ayushi", "Babita", "Bageshri", "Bahula", "Balika", "Banashree", 
  "Banhi", "Bani", "Barnali", "Basanti", "Bhagwati", "Bhairavi", "Bharani", "Bharati", "Bhargavi", "Bhavani", 
  "Bhavya", "Bindu", "Brinda", "Chameli", "Chandra", "Chandrika", "Charu", "Charusheela", "Chaya", "Chhavi", 
  "Chinmayi", "Daksha", "Damayanti", "Damini", "Darpana", "Darshita", "Dayita", "Deeksha", "Deepali", "Deepanshi", 
  "Deepti", "Deshna", "Devyani", "Dhanalakshmi", "Dhanashri", "Dhanishta", "Dhanvi", "Dhanyata", "Dharini", "Dharitri", 
  "Dhwani", "Diksha", "Dilara", "Dipanwita", "Dipika", "Dipti", "Divyanshi", "Drashti", "Duhita", "Durga", 
  "Dyuthi", "Ekaparnika", "Ekta", "Ena", "Enakshi", "Falguni", "Gargi", "Gaurika", "Gautami", "Gayathri", 
  "Geetanjali", "Geethika", "Gowri", "Grishma", "Gul", "Gulshan", "Gunjan", "Gurnoor", "Haimi", "Hamsa", 
  "Hanisha", "Hansika", "Harleen", "Haryali", "Hasini", "Heena", "Hemangi", "Hemangini", "Hina", "Hiral", 
  "Hita", "Hunar", "Ibha", "Ichha", "Idika", "Ina", "Inaya", "Indrani", "Indu", "Indulekha", 
  "Ira", "Ishana", "Ishanvi", "Ishika", "Ishita", "Ishwarya", "Iti", "Iva", "Iyla", "Jaimini", 
  "Jalaja", "Jamuna", "Janaki", "Janani", "Janvi", "Jasleen", "Jasmine", "Jaspreet", "Jeevika", "Jhanvi", 
  "Jivika", "Joshita", "Juhi", "Jui", "Jyoti", "Jyotsna", "Kadambari", "Kaira", "Kalinda", "Kalpana", 
  "Kalyani", "Kamakshi", "Kamala", "Kamya", "Kanak", "Kanakavalli", "Kanchan", "Kanishka", "Kanti", "Karishma", 
  "Karnika", "Kashi", "Kashvi", "Kasturi", "Kasvi", "Katyayani", "Kavya", "Keertana", "Keya", "Kimaya", 
  "Kiran", "Kirtida", "Kishori", "Komal", "Krishna", "Krithika", "Krutika", "Kshetra", "Kshitija", "Kshitrija", 
  "Kumud", "Kunika", "Kusum", "Laaibah", "Labdhi", "Laboni", "Lahari", "Lakshana", "Lata", "Latika", 
  "Lavanya", "Laveena", "Lekha", "Lekhya", "Lipika", "Lochan", "Lopamudra", "Madhu", "Madhulika", "Madhumita", 
  "Madhushree", "Madira", "Mahalakshmi", "Maheswari", "Mahika", "Mahira", "Mahisha", "Mahita", "Maitreyi", "Mala", 
  "Malathi", "Malati", "Malini", "Mallika", "Malvika", "Mandakini", "Mandira", "Mannat", "Manvi", "Marichi", 
  "Medhavi", "Medini", "Meenakshi", "Meera", "Meetali", "Megha", "Meghana", "Meher", "Meira", "Minakshi", 
  "Mohana", "Moksha", "Mona", "Moni", "Monisha", "Mridula", "Mukta", "Munjal", "Mythili", "Nabhi", 
  "Naisha", "Nakshatra", "Namrata", "Nandini", "Nandita", "Narmada", "Nasrin", "Natasha", "Navami", "Nayana", 
  "Nayanthara", "Neelam", "Neelima", "Neeta", "Neetu", "Neeyati", "Nehali", "Neeraja", "Neeti", "Netra", 
  "Nidhi", "Nilanjana", "Nilima", "Nilofar", "Nimisha", "Nimrat", "Nirupama", "Nirvana", "Nishtha", "Nitara", 
  "Niti", "Nitika", "Nitya", "Nivetha", "Niyati", "Nupur", "Nysa", "Ojasvi", "Ojaswini", "Omkara", 
  "Omya", "Onisha", "Ooha", "Opal", "Ovi", "Pahi", "Pakhi", "Palak", "Pallavi", "Pamela", 
  "Panchami", "Pari", "Parijat", "Parineeta", "Parnika", "Parnita", "Parul", "Parvatidevi", "Parveen", "Pauravi", 
  "Pavani", "Pavitra", "Pearly", "Phalgu", "Phoolan", "Piya", "Pragati", "Pragnya", "Prajakta", "Pramila", 
  "Pranali", "Pranavi", "Praneetha", "Pranita", "Prasanna", "Prasiddhi", "Pratima", "Pravallika", "Prayukta", "Prerana", 
  "Priyadarshini", "Priyamvada", "Puja", "Punarvasu", "Purvi", "Pushan", "Pushti", "Rachita", "Radhya", "Ragini", 
  "Rageshwari", "Rajeshwari", "Rajkumari", "Rajlakshmi", "Rakshita", "Ramani", "Rashmika", "Rati", "Ratika", "Ratna", 
  "Reimona", "Renuka", "Resham", "Reva", "Richa", "Riddhi", "Rigved", "Rimi", "Rina", "Ritambhara", 
  "Riti", "Ritika", "Riya", "Roma", "Roshnee", "Rubina", "Ruchira", "Rudrani", "Ruhi", "Rukmini", 
  "Rupinder", "Saanvika", "Sachi", "Sadhana", "Sadhika", "Sadika", "Sagarika", "Sahana", "Saharika", "Sahasra", 
  "Saheli", "Sahiti", "Sahitya", "Sailee", "Saira", "Saisha", "Saivaani", "Saketa", "Saketha", "Sakhee", 
  "Saloni", "Sama", "Samhita", "Samidha", "Samikshya", "Sampriti", "Samyukta", "Sanamika", "Sanchi", "Sanghamitra", 
  "Sanghamitra", "Sanskriti", "Santana", "Santhi", "Sanya", "Saraswathi", "Sargun", "Sarita", "Saroja", "Sathya", 
  "Sathyavati", "Satpriya", "Satya", "Satyabhama", "Saubhagya", "Saundarya", "Savar", "Savarna", "Savita", "Sayantani", 
  "Sejal", "Shanaya", "Shanthi", "Sharmistha", "Shatakshi", "Shatabdi", "Shayana", "Shefalika", "Shehnaaz", "Shikha", 
  "Shilpika", "Shinjini", "Shipra", "Shiuli", "Shivali", "Shivangini", "Shivangi", "Shobha", "Shobhana", "Shradha", 
  "Shreeja", "Shreshtha", "Shrijani", "Shrikriti", "Shristi", "Shriya", "Shruthi", "Shruthika", "Shubhangi", "Shubhashini", 
  "Shuchita", "Shvetali", "Siddhi", "Simantini", "Simer", "Simone", "Sindhuja", "Sinduri", "Sini", "Siya", 
  "Smita", "Smriti", "Smritika", "Sneh", "Snehlata", "Sohalia", "Somya", "Sonali", "Sonika", "Soorya", 
  "Soumya", "Soundarya", "Sraddha", "Srija", "Srirupa", "Sritha", "Srividya", "Sruthi", "Stuti", "Subhashree", 
  "Subhi", "Subhiksha", "Suchandra", "Sucharita", "Suchismita", "Sudeepta", "Sudha", "Sudipta", "Suhaani", "Sukanya", 
  "Suman", "Sumitra", "Sunaina", "Sunanda", "Sunehri", "Sunetra", "Sunita", "Suparna", "Supriti", "Surabhi", 
  "Suranjana", "Surbhi", "Suruchi", "Suryakantam", "Suryani", "Susmita", "Suvarna", "Suvina", "Suyasha", "Swaha", 
  "Swanandi", "Swapnali", "Swarnalatha", "Swetha", "Syna", "Taahira", "Tamanna", "Tanaya", "Tanima", "Tanishka", 
  "Taniya", "Tanushree", "Tanuza", "Tapasya", "Tapti", "Taranika", "Tarannum", "Tarika", "Tarini", "Tarunika", 
  "Tejal", "Tejashree", "Tejasri", "Thanvi", "Thanya", "Tripti", "Trisha", "Trushna", "Tulika", "Twinkle", 
  "Twisha", "Uditi", "Ujjwala", "Umang", "Unnati", "Urja", "Urvashi", "Uttara", "Vaani", "Vachana", 
  "Vaibhavi", "Vaidehi", "Vaijayanti", "Vaishnavi", "Vakula", "Vallari", "Vama", "Vani", "Vanya", "Varija", 
  "Varnika", "Varsha", "Varshini", "Vasuda", "Vasudha", "Vasumati", "Vedanshi", "Vedanti", "Vedanvita", "Vedika", 
  "Vela", "Vibha", "Vibhuti", "Vidisha", "Vidula", "Vidushi", "Vijeta", "Vimala", "Vinata", "Vinutha", 
  "Visakha", "Vishakha", "Vishaya", "Vishveshwari", "Vishwa", "Vritika", "Vritti", "Vrushali", "Vyoma", "Waheeda", 
  "Yamuna", "Yashashwini", "Yashvi", "Yauvani", "Yoshita", "Yukta", "Yukti", "Yuthika", "Zahra", "Zainab", 
  "Zara", "Zeba", "Zoha", "Zoya"
];

const commonIndianLastNames = [
  "Sharma", "Verma", "Singh", "Gupta", "Kumar", "Jha", "Mishra", "Shukla", "Trivedi", "Pandey",
  "Tiwari", "Chauhan", "Yadav", "Choudhary", "Chaudhary", "Thakur", "Prasad", "Saxena", "Tyagi", "Aggarwal",
  "Agarwal", "Garg", "Kapoor", "Khanna", "Mehra", "Malhotra", "Anand", "Arora", "Bhardwaj", "Bhatia",
  "Bhatnagar", "Chawla", "Chopra", "Dhawan", "Dua", "Goel", "Grover", "Gulati", "Jaggi", "Johar",
  "Juneja", "Kakar", "Kalra", "Kashyap", "Kohli", "Luthra", "Mahajan", "Malik", "Mittal", "Nagpal",
  "Narula", "Oberoi", "Puri", "Rastogi", "Sachdeva", "Saini", "Saluja", "Seth", "Sethi", "Suri",
  "Taneja", "Tandon", "Tuli", "Uppal", "Vohra", "Wadhwa", "Walia", "Wason", "Ahuja", "Bhalla",
  "Dhillon", "Gill", "Sandhu", "Bajwa", "Grewal", "Mann", "Multani", "Sidhu", "Virk", "Attri",
  "Bahl", "Bedi", "Bhatti", "Bindra", "Bisht", "Dhingra", "Dutta", "Hora", "Kakkar", "Khurana",
  "Lal", "Mathur", "Nair", "Pahwa", "Rajput", "Sodhi", "Soni", "Sood", "Srivastava", "Tripathi",
  
  // South Indian surnames
  "Nair", "Menon", "Pillai", "Kurup", "Iyer", "Iyengar", "Raman", "Krishnan", "Swamy", "Naidu",
  "Reddy", "Rao", "Acharya", "Adiga", "Bhagat", "Bhatt", "Hegde", "Kamath", "Kulkarni", "Pai",
  "Patel", "Shenoy", "Alva", "Ayyar", "Bhat", "Bhatkar", "Chari", "Desai", "Gowda", "Hande",
  "Jayaraman", "Joshi", "Karanth", "Kini", "Krishnamurthy", "Nayak", "Prabhu", "Ramachandran", "Ramaswamy", "Sastry",
  "Subramaniam", "Varma", "Achrekar", "Agarkar", "Bendre", "Bhosle", "Gavaskar", "Gokhale", "Gupte", "Kale",
  "Karnik", "Kher", "Kirloskar", "Mhatre", "More", "Nadkarni", "Nagarkar", "Pandit", "Patil", "Sathe",
  "Savarkar", "Tendulkar", "Vaidya", "Vartak", "Deshpande", "Dixit", "Khandekar", "Phadke", "Phadnis", "Tambe",
  "Vengurlekar", "Venkataraman", "Vishwanathan", "Raju", "Venkatesh", "Murthy", "Chander", "Laxman", "Shastri", "Chakravarthy",
  "Padmanabhan", "Ranganathan", "Balasubramaniam", "Chandrasekhar", "Parthasarathy", "Sitaraman", "Arunachalam", "Venkatesan", "Natarajan", "Mani",
  "Sundaram", "Murugan", "Devi", "Murali", "Chandrasekar", "Vasudevan", "Raghavan", "Damodaran", "Swaminathan", "Balakrishnan",
  "Kalyanaraman", "Ananthapadmanabhan", "Srikanth", "Venkataramanan", "Narayanan", "Muthukrishnan", "Ganesan", "Palaniappan", "Krishnaswamy", "Gopalakrishnan",
  
  // East Indian surnames
  "Banerjee", "Chatterjee", "Mukherjee", "Ganguly", "Karmakar", "Ghosh", "Bose", "Das", "Dey", "Roy", "Sen",
  "Chakraborty", "Dasgupta", "Bhattacharya", "Dutta", "Majumdar", "Sengupta", "Ghoshal", "Bhowmik", "Chanda", "Kundu",
  "Mondal", "Saha", "Sarkar", "Sinha", "Biswas", "Deb", "Guha", "Nandi", "Pal", "Poddar",
  "Choudhuri", "Bandyopadhyay", "Chakrabarti", "Mukhopadhyay", "Bhattacharyya", "Chattopadhyay", "Gangopadhyay", "Bagchi", "Basu", "Bhaduri",
  "Bhaumik", "Chaki", "Chakravarty", "Choudhury", "Datta", "Goswami", "Hazra", "Kar", "Lahiri", "Mitra",
  "Nandy", "Palit", "Sanyal", "Som", "Bakshi", "Barman", "Chaudhuri", "Haldar", "Jana", "Moitra",
  "Purkayastha", "Rakshit", "Ray", "Singha", "Talukdar", "Barua", "Bhattacharyya", "Bhuyan", "Bordoloi", "Bora",
  "Brahma", "Chetia", "Chetri", "Deka", "Gohain", "Gogoi", "Goswami", "Hazarika", "Kakati", "Kalita",
  "Phukan", "Rabha", "Thakur", "Mazumdar", "Mahanta", "Rajkhowa", "Saikia", "Sharma", "Tamuli", "Sonowal",
  
  // West Indian surnames
  "Shah", "Patel", "Mehta", "Modi", "Gandhi", "Panchal", "Parikh", "Parekh", "Rana", "Sheth",
  "Amin", "Bhagat", "Bhavsar", "Chauhan", "Chokshi", "Dave", "Desai", "Doshi", "Gajjar", "Jani",
  "Joshi", "Kanabar", "Mistry", "Pandya", "Prajapati", "Raval", "Savani", "Soni", "Trivedi", "Vora",
  "Vyas", "Bhatt", "Bhattacharya", "Dalal", "Darji", "Gada", "Irani", "Jhaveri", "Kamdar", "Kothari",
  "Lakhani", "Majmudar", "Mehta", "Merchant", "Mody", "Mota", "Muni", "Parmar", "Pithawala", "Ruparel",
  "Sanghavi", "Shroff", "Sodha", "Tanna", "Thakkar", "Zaveri", "Ajmera", "Amlani", "Bafna", "Baldota",
  "Bhandari", "Chandak", "Chhajed", "Chordia", "Daga", "Doshi", "Firodia", "Galada", "Goenka", "Jain",
  "Jhunjhunwala", "Kabra", "Kedia", "Kotecha", "Maheshwari", "Mantri", "Nahata", "Oswal", "Patni", "Ranka",
  "Ruia", "Sarda", "Saraf", "Singhal", "Surana", "Taparia", "Tayal", "Tibrewala", "Toshniwal", "Bajaj",
  
  // Central Indian surnames
  "Agrawal", "Jaiswal", "Khandelwal", "Rathore", "Tomar", "Chouhan", "Chandel", "Bundela", "Baghel", "Holkar",
  "Scindia", "Bhonsle", "Shinde", "Gaekwad", "Peshwa", "Pawar", "Jadhav", "Yadav", "Gaikwad", "Bhosale",
  "Maratha", "Sahukar", "Dikshit", "Khatri", "Khare", "Pande", "Dwivedi", "Chaturvedi", "Dubey", "Upadhyay",
  "Pathak", "Bajpai", "Valmiki", "Gahlot", "Shekhawat", "Sisodiya", "Parmar", "Rajawat", "Solanki", "Rawal",
  "Sisodia", "Rawat", "Ahirwar", "Bairwa", "Bansal", "Chahar", "Chandrawat", "Choudhury", "Deora", "Dhakad",
  "Gaur", "Gehlot", "Godara", "Jangid", "Jat", "Kachhawa", "Kataria", "Kumawat", "Kunwar", "Mahavar",
  "Makwana", "Mev", "Nagar", "Nat", "Panwar", "Porwal", "Prajapat", "Rajpurohit", "Saran", "Songara",
  "Suthar", "Tanwar", "Tak", "Udawat", "Vaishya", "Verma", "Vijay", "Vishnoi", "Vyas", "Yadava",
  "Gokhale", "Puntambekar", "Parashar", "Moghe", "Lavate", "Samadhiya", "Gajbhiye", "Wankhede", "Rahangdale", "Mandawe",
  
  // Mixed region surnames
  "Achari", "Adani", "Advani", "Banerji", "Bhansali", "Birla", "Chakravarty", "Dalmia", "Damani", "Dani",
  "Dhingra", "Doctor", "Engineer", "Fernandes", "Goenka", "Goyal", "Hinduja", "Hiranandani", "Jhunjhunwala", "Jindal",
  "Kirpalani", "Lulla", "Masani", "Nebhnani", "Parekh", "Parikh", "Piramal", "Punjabi", "Raheja", "Ramsinghani",
  "Rohatgi", "Sabharwal", "Sahni", "Sarabhai", "Setalvad", "Singhania", "Sippy", "Somani", "Tahiliani", "Talwar",
  "Tata", "Thapar", "Vaswani", "Wadia", "Adnani", "Anthony", "Barretto", "Basu", "Batra", "Bera",
  "Bhagwat", "Bhaktiar", "Bhandare", "Chandna", "Cherian", "Chopda", "Dandekar", "D'Cruz", "D'Souza", "Dayal",
  "Dhariwal", "Doulatani", "Dugar", "Gaba", "Ganatra", "Gidwani", "Govitrikar", "Harilela", "Hemdev", "Hemrajani",
  "Hindocha", "Israni", "Jeswani", "Jethanandani", "Jhaveri", "Jiandani", "Joseph", "Kampani", "Keswani", "Khambata",
  "Kochar", "Kodwani", "Kripalani", "Kriplani", "Ladhani", "Lalwani", "Lamba", "Madhvani", "Malani", "Mamtani",
  "Manek", "Manghnani", "Mansukhani", "Mayekar", "Mayur", "Merwani", "Methrani", "Motwani", "Nanavati", "Nichani",
  "Pahlajani", "Parikh", "Patodia", "Periwal", "Punjabi", "Qureshi", "Rajwani", "Ramchandani", "Ramsinghani", "Rohra",
  "Ruparel", "Sajdeh", "Samtani", "Sanghvi", "Sawhney", "Sawlani", "Shahdadpuri", "Shahani", "Sharma", "Shekhawat",
  "Shethia", "Shivdasani", "Siddique", "Tahilramani", "Thacker", "Advani", "Basrai", "Bhambhani", "Chandnani", "Chellaram",
  "Chulani", "Daswani", "Gajria", "Gidoomal", "Harjani", "Hasija", "Hathiramani", "Hingorani", "Jham", "Kalro",
  "Karani", "Karnani", "Katyal", "Kewalramani", "Kundnani", "Lakhiani", "Lekhraj", "Mahtani", "Malkani", "Mirchandani",
  "Mulchandani", "Nebhrajani", "Nichani", "Pessumal", "Punwani", "Raheja", "Rochwani", "Sadarangani", "Sahijwani", "Savla",
  "Shahani", "Shahdadpuri", "Shethi", "Sidhpuria", "Sipahimalani", "Sitlani", "Sunderdas", "Tahil", "Tajani", "Tanwani",
  "Tarneja", "Teckchandani", "Thakurdas", "Tharwani", "Tolani", "Udhwani", "Uttamchandani", "Vasnani", "Vassandani", "Wadhumal",
  "Wadhwani", "Ahuja", "Aneja", "Asrani", "Bairamani", "Bajaj", "Balani", "Bhatia", "Bhavnani", "Chhabria",
  "Chibber", "Chugani", "Dadlani", "Daryanani", "Gehani", "Golani", "Gulrajani", "Hathiramani", "Jagtiani", "Jaisinghani",
  "Jethwani", "Kalwani", "Karani", "Kevalramani", "Khemlani", "Khiani", "Khubchandani", "Kukreja", "Lakhani", "Lalchandani",
  "Lalvani", "Lulla", "Madhwani", "Magnani", "Manglani", "Melwani", "Moorjani", "Nagdev", "Nagrani", "Naraindas",
  "Nathwani", "Nebhani", "Nichani", "Notani", "Relwani", "Sahijram", "Sajnani", "Shivdasani", "Sukhwani", "Tahliani",
  "Udeshi", "Vaswani", "Vithaldas", "Anthony", "Baretto", "Britto", "Carvalho", "Costa", "Couto", "Coutinho",
  "Cruz", "D'Almeida", "D'Costa", "D'Cruz", "D'Mello", "D'Silva", "D'Souza", "Dias", "Fernandes", "Ferrao",
  "Gomes", "Mascarenhas", "Menezes", "Miranda", "Noronha", "Pereira", "Pinto", "Rodrigues", "Rosario", "Sequeira",
  "Abraham", "Ahmed", "Ali", "Chacko", "Eapen", "George", "Hassan", "Iqbal", "Jacob", "John",
  "Khan", "Kurian", "Mathew", "Mohammed", "Ninan", "Oommen", "Panicker", "Patel", "Philip", "Sayed",
  "Thomas", "Varghese", "Zachariah", "Abdullah", "Cheriyan", "Imam", "Issac", "Kapur", "Kuruvilla", "Lukose",
  "Mammen", "Mani", "Mathai", "Mohan", "Moideen", "Nambiar", "Nayar", "Pothen", "Sami", "Sarma",
  "Sharif", "Sheikh", "Shenoy", "Soman", "Tharakan", "Thayyil", "Verghese", "Zacharia", "Bakshi", "Baruah",
  "Bora", "Borah", "Bordoloi", "Changkakoti", "Choudhury", "Deka", "Dutta", "Gohain", "Goswami", "Handique",
  "Hazarika", "Kakoti", "Kalita", "Kataki", "Mahanta", "Nath", "Phukan", "Rajkonwar", "Saikia", "Sharma",
  "Talukdar", "Abbas", "Ansari", "Azmi", "Baig", "Farooqui", "Haque", "Hashmi", "Husain", "Jafri",
  "Mirza", "Naqvi", "Nomani", "Qureshi", "Rizvi", "Siddiqi", "Usmani", "Burman", "Debbarma", "Dey",
  "Hembram", "Jamatia", "Marak", "Munda", "Murmu", "Oraon", "Topno", "Tudu", "Abrol", "Handoo",
  "Hangloo", "Kaul", "Khan", "Khanna", "Kher", "Khosla", "Koul", "Mattoo", "Nehru", "Pandit",
  "Parimoo", "Raina", "Razdan", "Reshi", "Sapru", "Shah", "Tickoo", "Wazir", "Zutshi", "Chakyar",
  "Chandran", "Divakaran", "Gopalan", "Kurup", "Menon", "Namboothiri", "Nambiar", "Namboodiri", "Nandakumar", "Nair",
  "Panikkar", "Pillai", "Potti", "Rajasekharan", "Thampi", "Unnithan", "Varma", "Wamnta"
];

// Regex patterns for validation
const nameRegexPattern = /^[A-Za-z\s.'-]+$/;
const specialCharPattern = /[^A-Za-z\s.'-]/;
const excessiveSpecialCharPattern = /[.'-]{2,}/;

// Name validation types
export interface NameValidationResult {
  isValid: boolean;
  name: string;
  confidence: number;
  issues: string[];
  suggestions: string[];
  message?: string;
}

// Common Indian naming patterns and rules
const commonIssues = {
  tooShort: 'Name is too short',
  noSpaces: 'Full name should contain at least first and last name',
  incorrectCapitalization: 'Name should be properly capitalized',
  specialCharacters: 'Name contains invalid special characters',
  numbersPresent: 'Name should not contain numbers',
  excessiveSpaces: 'Name contains excessive spaces',
  missingLastName: 'Indian names typically include a last name'
};

// Basic validation checks
const validateBasicRules = (name: string): { issues: string[], confidence: number } => {
  const issues: string[] = [];
  let confidence = 100;
  
  // Check name length
  if (name.length < 3) {
    issues.push(commonIssues.tooShort);
    confidence -= 30;
  }
  
  // Check for numbers
  if (/\d/.test(name)) {
    issues.push(commonIssues.numbersPresent);
    confidence -= 40;
  }
  
  // Check for invalid special characters (allowing periods and hyphens)
  if (/[^a-zA-Z\u0900-\u097F\s.\-]/u.test(name)) {
    issues.push(commonIssues.specialCharacters);
    confidence -= 30;
  }
  
  // Check for excessive spaces
  if (/\s{2,}/.test(name)) {
    issues.push(commonIssues.excessiveSpaces);
    confidence -= 15;
  }
  
  // Check for proper capitalization (each name part should be capitalized)
  const nameParts = name.trim().split(/\s+/);
  const allProperlyCapitalized = nameParts.every(part => 
    part.length > 0 && part[0] === part[0].toUpperCase() && part.slice(1) === part.slice(1).toLowerCase()
  );
  
  if (!allProperlyCapitalized) {
    issues.push(commonIssues.incorrectCapitalization);
    confidence -= 20;
  }
  
  // Check for full name (first and last name)
  if (nameParts.length < 2) {
    issues.push(commonIssues.missingLastName);
    confidence -= 15;
  }
  
  return { issues, confidence: Math.max(0, confidence) };
};

// Generate suggestions for fixing identified issues
const generateSuggestions = (name: string, issues: string[]): string[] => {
  const suggestions: string[] = [];
  const nameParts = name.trim().split(/\s+/);
  
  // Fix capitalization
  if (issues.includes(commonIssues.incorrectCapitalization)) {
    const properlyCapitalized = nameParts.map(part => 
      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    ).join(' ');
    
    suggestions.push(properlyCapitalized);
  }
  
  // Fix excessive spaces
  if (issues.includes(commonIssues.excessiveSpaces)) {
    const fixedSpaces = name.replace(/\s+/g, ' ').trim();
    suggestions.push(fixedSpaces);
  }
  
  // If name is missing last name, suggest common Indian last names
  if (issues.includes(commonIssues.missingLastName) && nameParts.length === 1) {
    const commonLastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Verma', 'Rao', 'Reddy', 'Nair', 'Joshi'];
    const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
    
    // Add 3 random last name suggestions
    for (let i = 0; i < 3; i++) {
      const randomLastName = commonLastNames[Math.floor(Math.random() * commonLastNames.length)];
      suggestions.push(`${firstName} ${randomLastName}`);
    }
  }
  
  return [...new Set(suggestions)]; // Remove duplicates
};

/**
 * Validates an Indian name and returns detailed validation results
 * @param name The name to validate
 * @returns Validation result with confidence score, issues, and suggestions
 */
export async function validateIndianName(name: string): Promise<NameValidationResult> {
  console.log(`[CLIENT] Validating Indian name: "${name}"`);
  
  // Basic input validation
  if (!name || typeof name !== 'string') {
    throw new Error('Invalid input: Name must be a non-empty string');
  }
  
  // Trim the name to remove leading/trailing whitespace
  const trimmedName = name.trim();
  
  // Perform our own validation checks
  const { issues, confidence } = validateBasicRules(trimmedName);
  
  // Generate suggestions for improvement
  const suggestions = generateSuggestions(trimmedName, issues);
  
  // Determine if the name is valid based on confidence threshold
  const isValid = confidence > 70;
  
  // Create a summary message from the first issue (if any)
  const message = issues.length > 0 ? issues[0] : isValid ? 'Valid Indian name' : undefined;
  
  const result = {
    isValid,
    name: trimmedName,
    confidence,
    issues,
    suggestions,
    message
  };
  
  console.log(`[CLIENT] Validation result for "${name}":`, { isValid, confidence, issuesCount: issues.length });
  
  return result;
}

/**
 * Batch validates multiple Indian names or separate first and last names
 * @param firstParam Array of names or first names
 * @param lastNames Optional array of last names
 * @returns Array of validation results or object with first/last name corrections
 */
export async function batchValidateIndianNames(names: string[]): Promise<NameValidationResult[]>;
export async function batchValidateIndianNames(
  firstNames: string[], 
  lastNames: string[]
): Promise<{
  firstNameCorrections: NameCorrection[],
  lastNameCorrections: NameCorrection[]
}>;
export async function batchValidateIndianNames(
  firstParam: string[],
  secondParam?: string[]
): Promise<NameValidationResult[] | {
  firstNameCorrections: NameCorrection[],
  lastNameCorrections: NameCorrection[]
}> {
  // If only one parameter provided, it's the names array
  if (!secondParam) {
    console.log(`[CLIENT] Batch validating ${firstParam.length} names`);
    
    if (!Array.isArray(firstParam)) {
      throw new Error('Invalid input: Names must be provided as an array');
    }
    
    // Process each name in parallel
    const validationPromises = firstParam.map(name => validateIndianName(name));
    const results = await Promise.all(validationPromises);
    
    console.log(`[CLIENT] Completed batch validation of ${results.length} names`);
    
    return results;
  }
  
  // Otherwise, we're dealing with firstNames and lastNames
  const firstNames = firstParam;
  const lastNames = secondParam;
  
  console.log(`[CLIENT] Batch validating ${firstNames.length} first names and ${lastNames.length} last names`);
  
  // Process first names
  const firstNameCorrections: NameCorrection[] = [];
  for (const name of firstNames) {
    if (!name || name.trim() === '') {
      firstNameCorrections.push({
        original: name,
        corrected: name,
        needsCorrection: false
      });
      continue;
    }
    
    const validation = await validateIndianName(name);
    
    firstNameCorrections.push({
      original: name,
      corrected: validation.suggestions.length > 0 ? validation.suggestions[0] : name,
      needsCorrection: !validation.isValid,
      reason: validation.message
    });
  }
  
  // Process last names
  const lastNameCorrections: NameCorrection[] = [];
  for (const name of lastNames) {
    if (!name || name.trim() === '') {
      lastNameCorrections.push({
        original: name,
        corrected: name,
        needsCorrection: false
      });
      continue;
    }
    
    const validation = await validateIndianName(name);
    
    lastNameCorrections.push({
      original: name,
      corrected: validation.suggestions.length > 0 ? validation.suggestions[0] : name,
      needsCorrection: !validation.isValid,
      reason: validation.message
    });
  }
  
  console.log(`[CLIENT] Completed batch validation of ${firstNames.length} first names and ${lastNames.length} last names`);
  
  return {
    firstNameCorrections,
    lastNameCorrections
  };
}
