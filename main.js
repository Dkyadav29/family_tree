const fs = require('fs');
const readline = require('readline');

class Person {
    constructor(name) {
        this.name = name;
        this.relationships = [];
    }

    addRelationship(relationship) {
        this.relationships.push(relationship);
    }
}

class Relationship {
    constructor(type, person) {
        this.type = type;
        this.person = person;
    }
}

class FamilyTree {
    constructor(filename) {
        this.filename = filename;
        this.people = {};
        this.loadFromFile();
    }
    

    addPerson(name) {
        if (!this.people[name]) {
            this.people[name] = new Person(name);
            this.saveToFile();
            console.log(`Person ${name} added.`);
        } else {
            console.log(`Person ${name} already exists.`);
        }
    }

    addRelationship(name, type) {
        if (!this.people[name]) {
            console.log(`Person ${name} does not exist.`);
            return;
        }

        const person = this.people[name];
        person.addRelationship(new Relationship(type, person));
        this.saveToFile();
        console.log(`Relationship '${type}' added for ${name}.`);
    }

    connect(name1, relationship, name2) {
        if (!this.people[name1] || !this.people[name2]) {
            console.log("Both persons should exist.");
            return;
        }

        const person1 = this.people[name1];
        const person2 = this.people[name2];

        person2.addRelationship(new Relationship(relationship, person1));
        this.saveToFile();
        console.log(`${name1} connected as ${relationship} of ${name2}.`);
    }

    countSons(name) {
        return this.countRelationships(name, 'son');
    }

    countDaughters(name) {
        return this.countRelationships(name, 'daughter');
    }

    countWives(name) {
        return this.countRelationships(name, 'wife');
    }

    fatherOf(name) {
        const person = this.people[name];
        if (!person) {
            console.log(`Person ${name} does not exist.`);
            return;
        }

        const fatherRelationship = person.relationships.find(rel => rel.type === 'father');
        if (fatherRelationship) {
            console.log(`Father of ${name} is ${fatherRelationship.person.name}.`);
        } else {
            console.log(`No father found for ${name}.`);
        }
    }

    countRelationships(name, relationshipType) {
        const person = this.people[name];
        if (!person) {
            console.log(`Person ${name} does not exist.`);
            return 0;
        }

        return person.relationships.filter(rel => rel.type === relationshipType).length;
    }

    saveToFile() {
        const data = [];
        for (const name in this.people) {
            const person = this.people[name];
            person.relationships.forEach(rel => {
                data.push(`${name},${rel.type},${rel.person.name}`);
            });
        }

        const csvData = data.join('\n');
        fs.writeFileSync(this.filename, csvData);
    }

    loadFromFile() {
        try {
            const data = fs.readFileSync(this.filename, 'utf8');
            const lines = data.split('\n');

            for (const line of lines) {
                const [name1, type, name2] = line.split(',');
                this.addPerson(name1);
                this.addPerson(name2);
                this.connect(name1, type, name2);
            }
        } catch (error) {
            console.log("Error loading family tree from file:", error);
        }
    }
}

// Function to create readline interface for user input
function getUserInput(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer);
        });
    });
}

// Usage
async function run() {
    const filename = 'family_tree.csv';
    const familyTree = new FamilyTree(filename);

    console.log("Family tree");

    while (true) {
        console.log("\nMenu:");
        console.log("1. Add Person");
        console.log("2. Add Relationship");
        console.log("3. Connect Persons");
        console.log("4. Count Sons");
        //console.log("4. Count Sons");
        console.log("5. Count Daughters");
        console.log("6. Count Wives");
        console.log("7. Father Of");
        console.log("8. Exit");

        const choice = parseInt(await getUserInput("Enter your choice: "));

        switch (choice) {
            case 1:
                const personName = await getUserInput("Enter person's name: ");
                familyTree.addPerson(personName);
                break;
                case 2:
                    const personNameToAddRelation = await getUserInput("Enter person's name to add relationship: ");
                    const relationName = await getUserInput("Enter relationship name: ");
                    familyTree.addRelationship(personNameToAddRelation, relationName);
                    break;
            case 3:
                const connectName1 = await getUserInput("Enter name 1: ");
                const connectRelation = await getUserInput("Enter relationship: ");
                const connectName2 = await getUserInput("Enter name 2: ");
                familyTree.connect(connectName1, connectRelation, connectName2);
                break;
            case 4:
                const sonName = await getUserInput("Enter person's name: ");
                console.log(`Number of sons: ${familyTree.countSons(sonName)}`);
                break;
            case 5:
                const daughterName = await getUserInput("Enter person's name: ");
                console.log(`Number of daughters: ${familyTree.countDaughters(daughterName)}`);
                break;
            case 6:
                const wifeName = await getUserInput("Enter person's name: ");
                console.log(`Number of wives: ${familyTree.countWives(wifeName)}`);
                break;
            case 7:
                const fatherName = await getUserInput("Enter person's name: ");
                familyTree.fatherOf(fatherName);
                break;
            case 8:
                console.log("Exiting...");
                process.exit(0);
            default:
                console.log("Invalid choice.");
        }
    }
}

run();
