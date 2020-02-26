
#pragma once

#include "beginh.dex"

class <%= tableName %>;

/////////////////////////////////////////////////////////////////////////////
//							ADM<%= documentName %>Obj
/////////////////////////////////////////////////////////////////////////////
//
class TB_EXPORT ADM<%= documentName %>Obj : public ADMObj
{     
	DECLARE_ADMCLASS(ADM<%= documentName %>Obj)
		
public:
	virtual	ADMObj*				GetADM					()					= 0;
	virtual	<%= tableName %>*	Get<%= tableBaseName %>	()			const	= 0;
	if (documentType === MASTER_DETAIL) {	
		virtual	<%= tableName %>Details*	GetDetail	(int nRow)		const	= 0;
	}
};

#include "endh.dex"
