
#pragma once
#include "beginh.dex"

/////////////////////////////////////////////////////////////////////////////
class TB_EXPORT <%= tableClassName %> : public SqlRecord
{
	DECLARE_DYNCREATE(<%= tableClassName %>) 

public:
<%if (defaultFields) { -%>
	DataStr		f_Code;
	DataStr		f_Description;
<% } -%>
	
public:
	<%= tableClassName %>(BOOL bCallInit = TRUE);

public:
    virtual void	BindRecord();
		
public:
	static  LPCTSTR  GetStaticName();
};


#include "endh.dex"