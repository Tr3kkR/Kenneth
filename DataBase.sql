-- GeographicLocation Table (Where is it?)
CREATE TABLE GeographicLocation (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Environment Table (Route to live - Dev, test, UAT/Pre-prod, Prod)
CREATE TABLE Environment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Role Table (Presentation, Application, Data, Logging, Auth)
CREATE TABLE Role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
    hash VARCHAR(255) NOT NULL UNIQUE
);

-- AssetType Table (Container, Server, Hypervisor, JAR file, Running Application, Static Code file)
CREATE TABLE AssetType (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- OperatingSystem Table (Windows, Mac, Linux, iOS, i/OS, IOS, z/OS, VMS, HP Non-stop, Unix)
CREATE TABLE OperatingSystem (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- ScanType Table (Discovery, CVE, Code)
CREATE TABLE ScanType (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL
);

-- CVE Table (CVE tests)
CREATE TABLE CVE (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- Asset Table (Should come from your CMDB, but you're more likely to get accuracy from discovery scans)
CREATE TABLE Asset (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    application TEXT,
    geographicLocationId INTEGER REFERENCES GeographicLocation(id),
    environmentId INTEGER REFERENCES Environment(id),
    roleId INTEGER REFERENCES Role(id),
    assetTypeId INTEGER REFERENCES AssetType(id),
    operatingSystemId INTEGER REFERENCES OperatingSystem(id)
);

-- Scan Table
CREATE TABLE Scan (
    id SERIAL PRIMARY KEY,
    scanTypeId INTEGER REFERENCES ScanType(id),
    date DATE NOT NULL
);

-- ScanAssets Table (junction table for Scan and Asset)
CREATE TABLE ScanAssets (
    scanId INTEGER REFERENCES Scan(id),
    assetId INTEGER REFERENCES Asset(id),
    PRIMARY KEY (scanId, assetId)
);

-- ScanVulnerabilities Table (junction table for Scan and CVE)
CREATE TABLE ScanCVE (
    scanId INTEGER REFERENCES Scan(id),
    CVEId INTEGER REFERENCES CVE(id),
    PRIMARY KEY (scanId, CVEId)
);

-- ScanHistory Table
CREATE TABLE ScanHistory (
    id SERIAL PRIMARY KEY,
    assetId INTEGER REFERENCES Asset(id),
    scanTypeId INTEGER REFERENCES ScanType(id),
    scanDate DATE NOT NULL
);

-- VulnerabilityHistory Table
CREATE TABLE VulnerabilityHistory (
    id SERIAL PRIMARY KEY,
    scanHistoryId INTEGER REFERENCES ScanHistory(id),
    CVEId INTEGER REFERENCES CVE(id),
    foundDate DATE NOT NULL
);
