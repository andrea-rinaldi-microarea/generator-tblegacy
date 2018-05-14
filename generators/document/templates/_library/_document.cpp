
#include "stdafx.h"

#include "D<%= documentName %>.h"  
#include <<%= moduleName %>\<%= dblName %>\<%= tableName %>.h>


#ifdef _DEBUG
#undef THIS_FILE
static char THIS_FILE[] = __FILE__;
#endif

/////////////////////////////////////////////////////////////////////////////
static TCHAR szParamCode[] = _T("paramCode");

//////////////////////////////////////////////////////////////////////////////
//             class DBT<%= documentName %> implementation
//////////////////////////////////////////////////////////////////////////////
//
//----------------------------------------------------------------------------
IMPLEMENT_DYNAMIC (DBT<%= documentName %>, DBTMaster)

//-----------------------------------------------------------------------------	
DBT<%= documentName %>::DBT<%= documentName %>
	(
		CRuntimeClass*		pClass, 
		CAbstractFormDoc*	pDocument
	)
	:
	DBTMaster (pClass, pDocument, _NS_DBT("<%= documentName %>"))
{
}

//-----------------------------------------------------------------------------
void DBT<%= documentName %>::OnEnableControlsForFind ()
{
	Get<%= tableBaseName %> ()->f_Code.SetFindable();
	Get<%= tableBaseName %> ()->f_Description.SetFindable();
}

//-----------------------------------------------------------------------------
void DBT<%= documentName %>::OnDisableControlsForEdit ()
{
	Get<%= tableBaseName %> ()->f_Code.SetReadOnly ();
}

//-----------------------------------------------------------------------------	
void DBT<%= documentName %>::OnPrepareBrowser (SqlTable* pTable)
{
	<%= tableName %>* pRec = (<%= tableName %>*) pTable->GetRecord();

	pTable->SelectAll();
	pTable->AddSortColumn(pRec->f_Code);
}

//-----------------------------------------------------------------------------
void DBT<%= documentName %>::OnDefineQuery ()
{
	m_pTable->SelectAll			();
	m_pTable->AddParam			(szParamCode,Get<%= tableBaseName %> ()->f_Code);
	m_pTable->AddFilterColumn	(Get<%= tableBaseName %> ()->f_Code);
}

//-----------------------------------------------------------------------------
void DBT<%= documentName %>::OnPrepareQuery ()
{
	m_pTable->SetParamValue (szParamCode, Get<%= tableBaseName %>()->f_Code);
}

//-----------------------------------------------------------------------------
BOOL DBT<%= documentName %>::OnCheckPrimaryKey	()
{
	return
		!Get<%= tableBaseName %> ()->f_Code.IsEmpty() ||
		!SetError(_TB("The code field is mandatory"));
}

//////////////////////////////////////////////////////////////////////////////
//									D<%= documentName %>                          //
//////////////////////////////////////////////////////////////////////////////
//
//-----------------------------------------------------------------------------
IMPLEMENT_DYNCREATE(D<%= documentName %>, CAbstractFormDoc)

//-----------------------------------------------------------------------------
D<%= documentName %>::D<%= documentName %>()
	:
	m_pDBT<%= documentName %>	(NULL)
{
}

//-----------------------------------------------------------------------------
<%= tableName %>*	D<%= documentName %>::Get<%= tableBaseName %> () const 
{ 
	return (<%= tableName %>*) m_pDBT<%= documentName %>->GetRecord(); 
}

//-----------------------------------------------------------------------------
BOOL D<%= documentName %>::OnAttachData()
{              
	SetFormTitle (_TB("<%= documentTitle %>"));
	
	m_pDBT<%= documentName %> = new DBT<%= documentName %> (RUNTIME_CLASS (<%= tableName %>), this);
	
	return Attach (m_pDBT<%= documentName %>);
}