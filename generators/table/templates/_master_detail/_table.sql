IF NOT EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[<%= tableName %>]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [dbo].[<%= tableName %>] (
    [DocID] [int] NOT NULL ,
    [DocNo] [varchar] (10) NULL CONSTRAINT DF_<%= tableBaseName %>_DocNo_00 DEFAULT (''),
    [DocDate] [datetime] NULL CONSTRAINT DF_<%= tableBaseName %>_DocDate_00  DEFAULT('17991231'),
	[LastSubId] [int] NULL CONSTRAINT DF_<%= tableBaseName %>_LastSubId_00 DEFAULT(0),
    CONSTRAINT [PK_<%= tableBaseName %>] PRIMARY KEY NONCLUSTERED
    (
     [DocID]
    ) ON [PRIMARY]
) ON [PRIMARY]

END
GO


IF NOT EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[<%= tableName %>Details]') AND OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [dbo].[<%= tableName %>Details] (
    [DocID] [int] NOT NULL ,
    [DocSubID] [int] NOT NULL ,
    [Code] [varchar] (12) NULL CONSTRAINT DF_<%= tableBaseName %>_Code_00 DEFAULT(''),
    [Description] [varchar] (128) NULL CONSTRAINT DF_<%= tableBaseName %>_Descriptio_00 DEFAULT (''),
    CONSTRAINT [PK_<%= tableBaseName %>Details] PRIMARY KEY NONCLUSTERED
    (
     [DocID],
     [DocSubID]
    ) ON [PRIMARY]
) ON [PRIMARY]

END
GO

