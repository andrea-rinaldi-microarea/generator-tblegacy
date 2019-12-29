
IF NOT EXISTS (SELECT dbo.syscolumns.name FROM dbo.syscolumns, dbo.sysobjects WHERE
	dbo.sysobjects.name = '<%= tablePhisicalName %>' AND dbo.sysobjects.id = dbo.syscolumns.id
	AND dbo.syscolumns.name = '<%= fieldName %>')
BEGIN
ALTER TABLE [dbo].[<%= tablePhisicalName %>]
	ADD [<%= fieldName %>] [varchar] (<%= fieldLen %>) NULL CONSTRAINT DF_<%= tableBaseName %>_<%= fieldName %>_00 DEFAULT ('')
END
GO


UPDATE [dbo].[<%= tablePhisicalName %>] SET [dbo].[<%= tablePhisicalName %>].[<%= fieldName %>] = '' WHERE [dbo].[<%= tablePhisicalName %>].[<%= fieldName %>] IS NULL
GO