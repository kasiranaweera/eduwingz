# Generated manually

from django.db import migrations
import uuid


def populate_document_sessions(apps, schema_editor):
    """Populate session field for existing documents"""
    Document = apps.get_model('chat', 'Document')
    ChatSession = apps.get_model('chat', 'ChatSession')
    Message = apps.get_model('chat', 'Message')
    
    # Process all documents that don't have a session yet
    documents_without_session = Document.objects.filter(session__isnull=True)
    
    for doc in documents_without_session:
        session_id = None
        
        # If document has a linked message, get session from message
        if doc.message_id:
            try:
                message = Message.objects.get(id=doc.message_id)
                if message and message.session_id:
                    session_id = message.session_id
            except Message.DoesNotExist:
                pass
        
        # If no session found from message, create or get a default session for this user
        if not session_id:
            default_session, created = ChatSession.objects.get_or_create(
                user_id=doc.user_id,
                title='Default Session',
                defaults={'id': uuid.uuid4()}
            )
            session_id = default_session.id
        
        # Update the document with the session
        doc.session_id = session_id
        doc.save(update_fields=['session_id'])


def reverse_populate_document_sessions(apps, schema_editor):
    """Reverse migration - set session to None"""
    Document = apps.get_model('chat', 'Document')
    Document.objects.all().update(session=None)


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0003_document_session_message_file'),
    ]

    operations = [
        migrations.RunPython(populate_document_sessions, reverse_populate_document_sessions),
    ]

